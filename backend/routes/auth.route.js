const { validSign,validLogin } = require('../helpers/valid');
const { registerController, activationController, loginControlller } = require('../controllers/auth.controller');

const router = require('express').Router();


router.post('/register',validSign,registerController);
router.post('/login',validLogin,loginControlller);
router.post('/activation',activationController);




module.exports = router;