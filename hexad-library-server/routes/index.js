const { Router } = require('express');
const {
    registerUser,
    authenticateUser,
    retrieveUser,

    addBooks,
    retrieveBooks,
    updateBook,
} = require('./handlers');
const { json: bodyParser } = require('body-parser');
const { jwtVerifier } = require('../mid-wares');

const router = new Router();

// All different endpoints

// User-oriented endpoints
router.post('/users', bodyParser(), registerUser);
router.post('/users/auth', bodyParser(), authenticateUser);
router.get('/users/:role', jwtVerifier, retrieveUser);

// Book-oriented endpoints
router.post('/add-book', [bodyParser(), jwtVerifier], addBooks);
router.get('/books', retrieveBooks);
router.patch('/book/:idNumber', [bodyParser(), jwtVerifier], updateBook);

module.exports = router;