const express = require('express')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const settings = require('./settings')
const cors = require('./middlewares/cors')

const app = express()
app.use(helmet())
app.use(bodyParser.json())
app.use(cors(["http://localhost:3000", "https://fluxo-app.github.io", "https://fluxo.hugohaggmark.com"]))

app.get('/', (req, res) => {
  return res
    .status(200)
    .send({message: `Welcome to the ${settings.appName} api!`})
})
app.use('/api', require('./api/api'))
app.use('/fake', require('./api/fake'))
app.use('/oauth', require('./api/oauth'))

app.listen(settings.appPort, () => {
  console.log('Running', {port: settings.appPort})
})
