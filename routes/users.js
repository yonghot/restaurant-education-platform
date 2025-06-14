const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// 사용자 프로필 조회
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '서버 에러가 발생했습니다.'
        });
    }
});

// 사용자 프로필 업데이트
router.put('/profile', protect, async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, email },
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '서버 에러가 발생했습니다.'
        });
    }
});

// 비밀번호 변경
router.put('/password', protect, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        // 현재 비밀번호 확인
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: '현재 비밀번호가 일치하지 않습니다.'
            });
        }

        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: '비밀번호가 성공적으로 변경되었습니다.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '서버 에러가 발생했습니다.'
        });
    }
});

module.exports = router; 