const { validSign,validLogin } = require('../helpers/valid');
const { registerController, activationController, loginControlller,googleLoginControlller, facebookController } = require('../controllers/auth.controller');

const router = require('express').Router();


router.post('/register',validSign,registerController);
router.post('/login',validLogin,loginControlller);
router.post('/activation',activationController);


router.post('/googlelogin',googleLoginControlller);
router.post('/facebooklogin',facebookController);




module.exports = router;