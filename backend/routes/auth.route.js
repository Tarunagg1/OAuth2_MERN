const { registerController } = require('../controllers/auth.controller');

const router = require('express').Router();

router.post('/register',registerController)


module.exports = router;