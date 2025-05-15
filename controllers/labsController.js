const Labs = require('../models/Labs')

exports.create = async (req, res) => {
    try{
        const {nome, desc, capacidade} = req.body;
        
        if (!req.file){
            return res.status(400).json({message: "Imagem não enviada"});
        }

        const lab = new Labs({
            nome,
            desc,
            capacidade,
            src: req.file.path
        });

        await lab.save();

        res.status(201).json({message: "Laboratório salvo com sucesso!"});

    } catch (error){
        console.error(error);
        res.status(500).json({message: "Erro ao salvar o laboratório", error: error.message});
    }
};