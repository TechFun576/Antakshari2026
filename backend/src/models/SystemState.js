const mongoose = require('mongoose');

const systemStateSchema = new mongoose.Schema({
    key: {
        type: String,
        unique: true,
        required: true,
    },
    value: {
        type: Number,
        required: true,
    }
});

module.exports = mongoose.model('SystemState', systemStateSchema);
