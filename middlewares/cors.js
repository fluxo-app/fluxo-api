const cors = require('cors')

module.exports = whitelist => {
  return cors({
    origin: (origin, callback) => {
      const originIsWhitelisted = whitelist.includes(origin)
      callback(null, originIsWhitelisted)
    },
    credentials: true
  })
}
