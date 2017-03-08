const session = require('cookie-session')
const querystring = require('querystring')
const settings = require('../settings')

module.exports = (req, res, next) => {
  if (!req.session || !req.session.oauth_access_token) {
    return res.status(401).send({
      signInUrl: `${settings.appUrl}/trello/login` 
    })
  }
  return next()
}
