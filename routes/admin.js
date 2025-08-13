const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// 관리자 권한 확인 미들웨어
router.use(protect);
router.use(authorize('admin'));

// 대시보드 통계
router.get('/dashboard', async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments();
        const recentUsers = await User.find()
            .sort('-createdAt')
            .limit(5)
            .select('name email createdAt');
        res.json({
            success: true,
            data: {
                totalUsers,
                recentUsers
            }
        });
    } catch (error) {
        next(error);
    }
});

// 사용자 관리
router.get('/users', async (req, res, next) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort('-createdAt');

        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        next(error);
    }
});

// 사용자 역할 변경
router.put('/users/:id/role', async (req, res, next) => {
    try {
        const { role } = req.body;
        
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 역할입니다.'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: '사용자를 찾을 수 없습니다.'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
});

// 사용자 삭제
router.delete('/users/:id', async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: '사용자를 찾을 수 없습니다.'
            });
        }

        await user.remove();

        res.json({
            success: true,
            message: '사용자가 삭제되었습니다.'
        });
    } catch (error) {
        next(error);
    }
});

// 학습 통계
router.get('/statistics', async (req, res, next) => {
    try {
        const userStats = await User.aggregate([
            {
                $group: {
                    _id: null,
                    totalUsers: { $sum: 1 },
                    activeUsers: {
                        $sum: {
                            $cond: [
                                { $gt: ['$lastLogin', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                userStats: userStats[0]
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router; 