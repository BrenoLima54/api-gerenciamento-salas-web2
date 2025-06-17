const express = require("express");
const router = express.Router();
const labController = require("../controllers/labsController");
const upload = require("../config/multer");
const auth = require("../middlewares/authUser");

router.post("/novo", auth, upload.single("file"), labController.create);

router.get("/relatorio", auth, labController.get);

router.get("/videoTutorial", labController.videoTutorial);

router.post("/bloquear/:lab", labController.block);

router.get('/laboratorio/temperatura/:temp', labController.updateTemperature);

router.get('/laboratorio/temperaturaAtual', labController.getTemperature);

module.exports = router;
