const express = require('express');
const router = express.Router();

const mathController = require('../controllers/parser-controller.js');
const authenticationMiddleware = require('../middlewares/authentication').authenticationMiddleware;

//Updates a Status Column From the Result of a Binary Calcuation (lessThan,greaterThan)
router.post('/parse', authenticationMiddleware, mathController.parseAndUpdateColumn);

module.exports = router;
