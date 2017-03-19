const express = require('express')
const router = express.Router()
const requireTrelloToken = require('../middlewares/requireTrelloToken')
const settings = require('../settings')
const NodeCache = require("node-cache")
const fluxoCache = new NodeCache({stdTTL: 300, checkperiod: 30})
const oauthHelper = require('../oauthHelper')

const getCacheKey = (resourceUrl, oauth_access_token, oauth_access_token_secret) => {
  return `${resourceUrl}|${oauth_access_token}|${oauth_access_token_secret}`
}

const doRequest = (resourceUrl, req, callback) => {
  const key = getCacheKey(resourceUrl, req.session.oauth_access_token, req.session.oauth_access_token_secret)
  let resource = fluxoCache.get(key)
  if (resource) {
    callback({
      status: 200,
      resource: resource
    })
  } else {
    const oa = oauthHelper.getOAuthFromRequest(req)
    oa.getProtectedResource(resourceUrl, "GET", req.session.oauth_access_token, req.session.oauth_access_token_secret, (error, data, response) => {
      if (error) {
        callback({
          status: error.statusCode,
          resource: error.data
        })
      }
      resource = JSON.parse(data)
      fluxoCache.set(key, resource)
      callback({
        status: 200,
        resource: resource
      })
    })
  }
}
const doTrelloRequest = (resourceUrl, req, res) => {
  const key = getCacheKey(resourceUrl, req.session.oauth_access_token, req.session.oauth_access_token_secret)
  let resource = fluxoCache.get(key)
  if (resource) {
    res
      .status(200)
      .json(resource)
  } else {
    const oa = oauthHelper.getOAuthFromRequest(req)
    oa.getProtectedResource(resourceUrl, "GET", req.session.oauth_access_token, req.session.oauth_access_token_secret, (error, data, response) => {
      if (error) {
        return res
          .status(500)
          .json(error)
          .end()
      }
      resource = JSON.parse(data)
      fluxoCache.set(key, resource)
      res
        .status(200)
        .json(resource)
    })
  }
}

router.use(requireTrelloToken)

router.get("/me", (req, res) => {
  doTrelloRequest("https://api.trello.com/1/members/me", req, res)
})

router.get("/my/boards", (req, res) => {
  doTrelloRequest("https://trello.com/1/members/my/boards", req, res)
})

router.get("/boards/:boardid/lists", (req, res) => {
  doTrelloRequest("https://trello.com/1/boards/" + req.params.boardid + "/lists", req, res)
})

router.get("/lists/:listid", (req, res) => {
  doRequest("https://trello.com/1/lists/" + req.params.listid, req, (list) => {
    if (list.status !== 200) {
      return res.status(list.status).send(list)
    }
    doRequest("https://trello.com/1/lists/" + req.params.listid + "/cards/?actions=updateCard:idList,createCard,copyCard,convertToCardFromCheckItem&filter=all&fields=name,labels,actions", req, (cards) => {
      if (cards.status !== 200) {
        return res.status(cards.status).send(cards)
      }

      const result = {
        id: list.resource.id,
        name: list.resource.name,
        cards: cards.resource
      }
      res.status(200).send(result)
    })
  })
})

router.get("/cards/:cardid", (req, res) => {
  doTrelloRequest("https://trello.com/1/cards/" + req.params.cardid + "/actions/?filter=createCard,updateCard:idList", req, res)
})

module.exports = router
