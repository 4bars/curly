const express = require('express');
const router = express.Router();
const mathRoutes = require('./math');
const parserRoutes = require('./parser');


router.use(mathRoutes);
router.use(parserRoutes);

router.get('/', function(req, res) {
  res.json(getHealth());
});

router.get('/health', function(req, res) {
  res.json(getHealth());
  res.end();
});

function getHealth() {
  return {
    ok: true,
    message: 'Healthy'
  };
}

module.exports = router;
