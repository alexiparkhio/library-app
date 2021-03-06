const { Router } = require('express');
const {
    registerUser,
    authenticateUser,
    retrieveUser,
    toggleWishlist,

    addBooks,
    retrieveBooks,
    updateBook,
    requestBook,
    removeBook,
    borrowBook,
    returnBorrowedBook,
} = require('./handlers');
const { json: bodyParser } = require('body-parser');
const { jwtVerifier } = require('../mid-wares');

const router = new Router();

// All different endpoints

// User-oriented endpoints
router.post('/users', bodyParser(), registerUser);
router.post('/users/auth', bodyParser(), authenticateUser);
router.get('/users/:role', jwtVerifier, retrieveUser);
router.patch('/wishlist/:ISBN', jwtVerifier, toggleWishlist);

// Book-oriented endpoints
router.post('/add-book', [bodyParser(), jwtVerifier], addBooks);
router.get('/books', retrieveBooks);
router.patch('/book/:ISBN', [bodyParser(), jwtVerifier], updateBook);
router.post('/request', [bodyParser(), jwtVerifier], requestBook);
router.delete('/book/:ISBN', jwtVerifier, removeBook);
router.patch('/borrow/:ISBN', jwtVerifier, borrowBook);
router.patch('/return/:ISBN', jwtVerifier, returnBorrowedBook);

module.exports = router;