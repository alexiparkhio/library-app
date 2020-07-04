const { Router } = require('express');
const {
    registerUser,
} = require('./handlers');
const { json: bodyParser } = require('body-parser');

const router = new Router();

// All different endpoints
router.post('/users', bodyParser(), registerUser);

module.exports = router;