const express = require('express');
const router = express.Router();

const mathController = require('../controllers/math-controller.js');
const authenticationMiddleware = require('../middlewares/authentication').authenticationMiddleware;

//Updates a Status Column From the Result of a Binary Calcuation (lessThan,greaterThan)
router.post('/math/update/status', authenticationMiddleware, mathController.binaryCalcuation);

module.exports = router;
