const OAuth = require('oauth').OAuth

module.exports = {
  getOAuthFromRequest: (req) => {
    return new OAuth(req.session.oa._requestUrl, req.session.oa._accessUrl, req.session.oa._consumerKey, req.session.oa._consumerSecret, req.session.oa._version, req.session.oa._authorize_callback, req.session.oa._signatureMethod)
  }
}
