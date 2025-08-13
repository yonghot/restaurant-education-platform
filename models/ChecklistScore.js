const mongoose = require('mongoose');

const checklistScoreSchema = new mongoose.Schema({
    scores: {
        type: [Number], // 10개 항목 점수
        required: true,
        validate: [arr => arr.length === 10, '10개 항목 점수가 필요합니다.']
    },
    total: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ChecklistScore', checklistScoreSchema); 