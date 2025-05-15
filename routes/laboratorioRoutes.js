const express = require("express");
const router = express.Router();
const Laboratorio = require("../models/Laboratorio");
const PDFDocument = require("pdfkit");
const fetch = require("node-fetch");

router.get("/relatorio", async (req, res) => {
  try {
    const laboratorios = await Laboratorio.find();
    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="relatorio_laboratorios.pdf"'
    );
    doc.pipe(res);

    doc.fontSize(18).text("Relatório de Laboratórios", { align: "center" });
    doc.moveDown();

    for (const lab of laboratorios) {
      doc.fontSize(14).text(lab.nome, { underline: true });
      doc.fontSize(12).text(`Capacidade: ${lab.capacidade}`);

      if (lab.foto) {
        try {
          const optimizedUrl = lab.foto.replace(
            "/upload/",
            "/upload/w_300,h_200,c_limit/"
          );

          const response = await fetch(optimizedUrl, {
            headers: {
              "User-Agent": "Node.js PDF Generator",
            },
            timeout: 5000,
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const imageBuffer = await response.buffer();
          doc.image(imageBuffer, {
            width: 200,
            align: "center",
          });
          doc.moveDown();
        } catch (error) {
          console.error("Erro ao carregar imagem:", {
            url: lab.foto,
            error: error.message,
          });
          doc.text("(Imagem não disponível)");
        }
      }
      doc.moveDown();
    }

    doc.end();
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    res.status(500).send("Erro ao gerar relatório");
  }
});

module.exports = router;
