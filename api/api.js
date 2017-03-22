const express = require('express')
const router = express.Router()
const settings = require('../settings')
const NodeCache = require("node-cache")
const resourceCache = new NodeCache({stdTTL: 300, checkperiod: 30})
const jwt = require('jsonwebtoken')

const getTokenFromRequest = (req) => {
  if (req.query.token) {
    return req.query.token
  }

  const authorization = req.headers['authorization']
  if (authorization) {
    return authorization.replace('Bearer ', '')
  }
}

router.use((req, res, next) => {
  const token = getTokenFromRequest(req)
  try {
    const decoded = jwt.verify(token, settings.appSecret)
    req.oauth_access_token = decoded.accessToken
    req.oauth_access_token_secret = decoded.accessTokenSecret
  } catch(err) {
    return res.status(401).send({
      signInUrl: `${settings.appUrl}/oauth/login`
    })
  }
  return next()
})

const getProtectedTrelloResource = (resourceUrl, req) => {
  const accessToken = req.oauth_access_token
  const accessTokenSecret = req.oauth_access_token_secret
  const cacheKey = `${resourceUrl}|${accessToken}|${accessTokenSecret}`

  return new Promise((resolve, reject) => {
    const cachedResource = resourceCache.get(cacheKey)
    if (cachedResource) {
      return resolve({
        statusCode: 200,
        resource: cachedResource
      })
    }

    settings.oauth.getProtectedResource(resourceUrl,
      "GET",
      accessToken,
      accessTokenSecret,
      (error, data, response) => {
        if (error) {
          return resolve({
            statusCode: error.statusCode,
            resource: {message:error.data}
          })
        }

        const json = JSON.parse(data)
        resourceCache.set(cacheKey, json)
        return resolve({
          statusCode: 200,
          resource: json
        })
      })
  })
}

router.get("/me", (req, res) => {
  getProtectedTrelloResource('https://api.trello.com/1/members/me', req)
    .then(response => res.status(response.statusCode).send(response.resource))
})

router.get("/my/boards", (req, res) => {
  getProtectedTrelloResource('https://trello.com/1/members/my/boards', req)
    .then(response => res.status(response.statusCode).send(response.resource))
})

router.get("/boards/:boardid/lists", (req, res) => {
  getProtectedTrelloResource(`https://trello.com/1/boards/${req.params.boardid}/lists`, req)
    .then(response => res.status(response.statusCode).send(response.resource))
})

router.get("/lists/:listid", (req, res) => {
  getProtectedTrelloResource(`https://trello.com/1/lists/${req.params.listid}//cards/?actions=updateCard:idList,createCard,copyCard,convertToCardFromCheckItem&filter=all&fields=name,labels,actions`, req)
    .then(response => res.status(response.statusCode).send(response.resource))
})

module.exports = router
