const { Router } = require('express');
const {
    registerUser,
    addBooks
} = require('./handlers');
const { json: bodyParser } = require('body-parser');
const { jwtVerifier } = require('../mid-wares');

const router = new Router();

// All different endpoints
router.post('/users', bodyParser(), registerUser);
router.post('/add-book', [bodyParser, jwtVerifier], addBooks);

module.exports = router;