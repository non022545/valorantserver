const express = require('express')
const Router = express.Router()


Router.get('/home', (req, res) => res.send('Hello home!'))


module.exports = Router