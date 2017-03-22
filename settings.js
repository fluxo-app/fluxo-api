const OAuth = require('oauth').OAuth
const appKey = process.env.FLUXOAPPKEY
const appSecret = process.env.FLUXOAPPSECRET
const appPort = Number(process.env.PORT || 3100)
const appUrl = process.env.FLUXOAPPURL || "http://localhost:" + appPort
const requestTokenUrl = "https://trello.com/1/OAuthGetRequestToken"
const accessURL = "https://trello.com/1/OAuthGetAccessToken"
const authorizeURL = "https://trello.com/1/OAuthAuthorizeToken"
const oauth = new OAuth(requestTokenUrl,
  accessURL,
  appKey,
  appSecret,
  "1.0",
  null,
  "HMAC-SHA1")

module.exports = {
  appName: "Fluxo",
  appSecret: appSecret,
  appPort: appPort,
  appUrl: appUrl,
  authorizeURL: authorizeURL,
  oauth: oauth
}
