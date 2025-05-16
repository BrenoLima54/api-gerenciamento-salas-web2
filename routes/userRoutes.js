const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')

router.post('/registrar', userController.create);

router.post('/logar', userController.logar);

module.exports = router;
