const express = require("express");
const router = express.Router();
const labController = require('../controllers/labsController');
const { routes } = require("../app");
const upload = require("../config/multer")

router.post('/novo', upload.single("file"), labController.create);

module.exports = router;