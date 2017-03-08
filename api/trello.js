const OAuth = require('oauth').OAuth
const express = require('express')
const router = express.Router()
const settings = require('../settings')
const oauthHelper = require('../oauthHelper')
const querystring = require('querystring')

router.get('/login', (req, res) => {
  const action = req.query.action ? "?action=" + querystring.escape(req.query.action) : ""
  const callbackUrl = `${settings.appUrl}/trello/callback${action}`
  const oa = new OAuth(settings.getRequestTokenUrl, settings.accessURL, settings.appKey, settings.appSecret, "1.0", callbackUrl, "HMAC-SHA1")

  oa.getOAuthRequestToken((error, oauth_token, oauth_token_secret, results) => {
    if (error) {
      return res
        .status(500)
        .send(error)
    } else {

      req.session.oa = oa
      req.session.oauth_token = oauth_token
      req.session.oauth_token_secret = oauth_token_secret

      const authorizeURL = `${settings.authorizeURL}?oauth_token=${oauth_token}&name=${settings.appName}`
      res.redirect(authorizeURL)
    }
  })
})

router.get('/callback', (req, res) => {
  const callbackUrl = `${settings.appUrl}/trello/callback${req.query.action}`
  const oa = oauthHelper.getOAuthFromRequest(req)
  oa.getOAuthAccessToken(req.session.oauth_token, req.session.oauth_token_secret, req.query.oauth_verifier, (error, oauth_access_token, oauth_access_token_secret, results2) => {
    if (error) {
      return res
        .status(500)
        .send(error)
    } else {
      req.session.oauth_access_token = oauth_access_token
      req.session.oauth_access_token_secret = oauth_access_token_secret

      const redirectUrl = req.query.action ? req.query.action : "/"
      res.redirect(redirectUrl)
    }
  })
})

module.exports = router
