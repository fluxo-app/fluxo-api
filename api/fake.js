const express = require('express')
const router = express.Router()
const fake = require('./fake.json')

router.get("/me", (req, res) => {
  const me = {
    id: "1",
    fullName: "Demo User",
    idBoards: ["1", "2"]
  }
  return res.status(200).json(me)
})

router.get("/my/boards", (req, res) => {
  const boards = [
    {
      id: "1",
      name: "Lorem"
    }, {
      id: "2",
      name: "Ipsum"
    }, {
      id: "3",
      name: "Dolor"
    }
  ]
  return res.status(200).json(boards)
})

router.get("/boards/:boardid/lists", (req, res) => {
  const lists = [
    {
      id: "1",
      name: "Inbox"
    }, {
      id: "2",
      name: "Doing"
    }, {
      id: "3",
      name: "Done"
    }
  ]
  return res.status(200).json(lists)
})

router.get("/lists/:listid", (req, res) => {
  res.status(200).json(fake)
})

module.exports = router
