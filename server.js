const express = require('express')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const settings = require('./settings')
const session = require('cookie-session')
const cors = require('./middlewares/cors')

const app = express()
app.use(helmet())
app.use(bodyParser.json())
app.use(cors(["http://localhost:3000", "https://fluxo-app.github.io"]))
app.use(session({
  name: "fluxov2",
  secret: "skjghskdjfasjdkiismmajjshbqigohqdiouk",
  maxAge: 30 * 24 * 60 * 60 * 1000
}));

app.get('/', (req, res) => {
  return res
    .status(200)
    .send({message: `Welcome to the ${settings.appName} api!`})
})
app.use('/api', require('./api/api'))
app.use('/fake', require('./api/fake'))
app.use('/trello', require('./api/trello'))

app.listen(settings.appPort, () => {
  console.log('Running', {port: settings.appPort})
})
