const { Router } = require('express');
const {
    registerUser,
    authenticateUser,
    addBooks
} = require('./handlers');
const { json: bodyParser } = require('body-parser');
const { jwtVerifier } = require('../mid-wares');

const router = new Router();

// All different endpoints

// User-oriented endpoints
router.post('/users', bodyParser(), registerUser);
router.post('/users/auth', bodyParser(), authenticateUser);

// Book-oriented endpoints
router.post('/add-book', [bodyParser(), jwtVerifier], addBooks);

module.exports = router;