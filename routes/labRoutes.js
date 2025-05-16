const express = require("express");
const router = express.Router();
const labController = require('../controllers/labsController');
const upload = require("../config/multer");

router.post('/novo', upload.single("file"), labController.create);

router.get('/relatorio', labController.get);

module.exports = router;