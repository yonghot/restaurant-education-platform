const express = require('express');
const router = express.Router();
const ChecklistScore = require('../models/ChecklistScore');

// 점수 제출 및 본인 백분위 반환
router.post('/submit', async (req, res) => {
    try {
        const { scores } = req.body;
        if (!Array.isArray(scores) || scores.length !== 10) {
            return res.status(400).json({ success: false, message: '10개 항목 점수가 필요합니다.' });
        }
        if (!scores.every(s => Number.isInteger(s) && s >= 1 && s <= 10)) {
            return res.status(400).json({ success: false, message: '각 점수는 1~10 사이의 정수여야 합니다.' });
        }
        const total = scores.reduce((a, b) => a + b, 0);
        const newScore = new ChecklistScore({ scores, total });
        await newScore.save();

        // 전체 데이터 불러오기
        const allScores = await ChecklistScore.find({}, 'scores total');
        // 각 항목별 백분위 계산
        const rankPerItem = scores.map((score, idx) => {
            const arr = allScores.map(doc => doc.scores[idx]);
            const below = arr.filter(s => s < score).length;
            return Math.round((below / arr.length) * 100); // 하위 %
        });
        // 총점 백분위 계산
        const totalArr = allScores.map(doc => doc.total);
        const belowTotal = totalArr.filter(s => s < total).length;
        const rankTotal = Math.round((belowTotal / totalArr.length) * 100);

        res.json({ success: true, result: { scores, total, rankPerItem, rankTotal } });
    } catch (err) {
        res.status(500).json({ success: false, message: '서버 오류', error: err.message });
    }
});

// 전체 통계 반환
router.get('/stats', async (req, res) => {
    try {
        const allScores = await ChecklistScore.find({}, 'scores total');
        if (allScores.length === 0) {
            return res.json({ itemStats: [], totalStats: {} });
        }
        // 각 항목별 통계
        const itemStats = Array(10).fill(0).map((_, idx) => {
            const arr = allScores.map(doc => doc.scores[idx]);
            arr.sort((a, b) => a - b);
            const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
            const min = arr[0];
            const max = arr[arr.length - 1];
            const p25 = arr[Math.floor(arr.length * 0.25)];
            const p50 = arr[Math.floor(arr.length * 0.5)];
            const p75 = arr[Math.floor(arr.length * 0.75)];
            return { avg, min, max, p25, p50, p75 };
        });
        // 총점 통계
        const totalArr = allScores.map(doc => doc.total).sort((a, b) => a - b);
        const avg = totalArr.reduce((a, b) => a + b, 0) / totalArr.length;
        const min = totalArr[0];
        const max = totalArr[totalArr.length - 1];
        const p25 = totalArr[Math.floor(totalArr.length * 0.25)];
        const p50 = totalArr[Math.floor(totalArr.length * 0.5)];
        const p75 = totalArr[Math.floor(totalArr.length * 0.75)];
        const totalStats = { avg, min, max, p25, p50, p75 };
        res.json({ itemStats, totalStats });
    } catch (err) {
        res.status(500).json({ success: false, message: '서버 오류', error: err.message });
    }
});

module.exports = router; 