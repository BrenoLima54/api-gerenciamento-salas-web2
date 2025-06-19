const Lab = require('../models/Labs');
const PDFDocument = require("pdfkit");
const fetch = require("node-fetch");
const fs = require('fs');
const path = require('path');
// const temperatureState = {currentTem:0}

exports.create = async (req, res) => {
    try {
        const { nome, desc, capacidade } = req.body;

        if (!nome || !desc || capacidade == null || isNaN(Number(capacidade))) {
            return res.status(400).json({ message: "Campos inválidos: nome, desc e capacidade numérica são obrigatórios." });
        }

        const existingLab = await Lab.findOne({ nome });
        if (existingLab) {
            return res.status(400).json({ error: 'Nome já cadastrado' });
        }

        if (!req.file || !req.file.path) {
            return res.status(400).json({ message: "Imagem não enviada" });
        }

        const lab = new Lab({
            nome,
            desc,
            capacidade: Number(capacidade),
            src: req.file.path 
        });

        await lab.save();

        res.status(201).json({ message: "Laboratório salvo com sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao salvar o laboratório", error: error.message });
    }
};

exports.get = async (req, res) => {
    try {
        const laboratorios = await Lab.find();
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
            doc.moveDown(0.5);

            if (lab.src) {
                try {
                    const response = await fetch(lab.src, {
                        headers: { "User-Agent": "Node.js PDF Generator" },
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
                        url: lab.src,
                        error: error.message,
                    });
                    doc.text("(Imagem não disponível)");
                }
            } else {
                doc.text("(Sem imagem cadastrada)");
            }

            doc.moveDown();
        }

        doc.end();
    } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        res.status(500).send("Erro ao gerar relatório");
    }
};

exports.block = (req, res) => {
    const lab = req.params.lab;
    const io = req.app.get('io');

    if (!lab) {
        return res.status(400).json({message: 'Laboratório não informado'});
    }
    
    io.emit(`bloquear(${lab})`, `Laboratório ${lab} foi bloqueado`);
    return res.status(200).json({message: `Laboratório ${lab} bloqueado e o broadcast foi enviado!`});
};

exports.videoTutorial = (req, res) => {
    const videoPath = path.join(__dirname, '../video/video.mp4');
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (!range) {
        res.writeHead(200, {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        });

        fs.createReadStream(videoPath).pipe(res);
    } else {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize -1;
        const chunkSize = end - start + 1;

        const file = fs.createReadStream(videoPath, {start, end});
        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': 'video/mp4',
        });
        file.pipe(res);
    }
};

var dadosTemperatura = []

exports.updateTemperature = (req, res) => {
  try {

    const temp = req.query.temp;
    
    dadosTemperatura.push(temp);

    res.status(200).json({ message: `Temperatura ${temp}°C recebida com sucesso.` });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao processar a temperatura.', error: error.message });
  }
};

exports.getTemperature = (req, res) => {
  try {
    res.json({'Temperaturas:': dadosTemperatura})
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar a temperatura.', error: error.message });
  }
};