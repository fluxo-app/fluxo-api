const express = require('express')
const router = express.Router()
const settings = require('../settings')
const NodeCache = require("node-cache")
const secretsCache = new NodeCache({stdTTL: 300, checkperiod: 30})
const jwt = require('jsonwebtoken')


router.get('/login', (req, res) => {
  const redirectUrl = req.query.redirectUrl
  const callbackUrl = `${settings.appUrl}/oauth/callback?redirectUrl=${redirectUrl}`
  settings.oauth._authorize_callback = callbackUrl

  settings.oauth.getOAuthRequestToken((error, token, tokenSecret, response) => {
    if (error) {
      return res.status(error.statusCode).send({message:error.data})
    }

    secretsCache.set(token, `${tokenSecret}`)

    res.writeHead(302, {'Location': `${settings.authorizeURL}?oauth_token=${token}&name=${settings.appName}`})
    res.end()
  })
})

router.get('/callback', (req, res) => {
  const token = req.query.oauth_token
  const redirectUrl = req.query.redirectUrl

  if (!token) {
    res.writeHead(302, {'Location': `${redirectUrl}?error=${'no oauth token'}`})
    return res.end()
    return res.status(401).send({message:'no oauth token'})
  }

  const tokenSecret = secretsCache.get(token)
  const verifier = req.query.oauth_verifier

  settings.oauth.getOAuthAccessToken(token, tokenSecret, verifier, (error, accessToken, accessTokenSecret, response) => {
    if (error) {
      return res.status(error.statusCode).send({message:error.data})
    }

    settings.oauth.getProtectedResource("https://api.trello.com/1/members/me", "GET", accessToken, accessTokenSecret, (error, data, response) => {
      if (error) {
        return res.status(error.statusCode).send({message:error.data})
      }

      const json = JSON.parse(data)
      const payload = {
        name: json.fullName,
        accessToken: accessToken,
        accessTokenSecret: accessTokenSecret,
      }

      const jsonWebToken = jwt.sign(payload, settings.appSecret, { expiresIn: '30d' });

      res.writeHead(302, {'Location': `${redirectUrl}?jwt=${jsonWebToken}`})
      res.end()
    })
  })
})

module.exports = router
