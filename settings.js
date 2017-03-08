const appPort = Number(process.env.PORT || 3100);

module.exports = {
  appKey: process.env.FLUXOAPPKEY,
  appSecret: process.env.FLUXOAPPSECRET,
  appName: "Fluxo",
  appPort: appPort,
  appUrl: process.env.FLUXOAPPURL || "http://localhost:" + appPort,
  getRequestTokenUrl: "https://trello.com/1/OAuthGetRequestToken",
  accessURL: "https://trello.com/1/OAuthGetAccessToken",
  authorizeURL: "https://trello.com/1/OAuthAuthorizeToken"
}
