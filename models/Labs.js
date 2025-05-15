const mongoose = require('mongoose');

const LabSchema = new mongoose.Schema({
    nome:{
        type: String,
        required: true,
        unique: true,
    },
    desc:{
        type: String,
        required: true
    },
    capacidade:{
        type: Number,
        required: true
    },
    src:{
        type: String, 
        required: true
    }

})

module.exports = mongoose.model('Labs', LabSchema);
// dados de nome, descrição, capacidade e foto.