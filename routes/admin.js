const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const { protect, authorize } = require('../middleware/auth');

// 관리자 권한 확인 미들웨어
router.use(protect);
router.use(authorize('admin'));

// 대시보드 통계
router.get('/dashboard', async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalCourses = await Course.countDocuments();
        const totalQuizzes = await Quiz.countDocuments();
        
        const recentUsers = await User.find()
            .sort('-createdAt')
            .limit(5)
            .select('name email createdAt');
            
        const recentCourses = await Course.find()
            .sort('-createdAt')
            .limit(5)
            .select('title category createdAt');
            
        const courseStats = await Course.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                totalUsers,
                totalCourses,
                totalQuizzes,
                recentUsers,
                recentCourses,
                courseStats
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

// 교육과정 관리
router.get('/courses', async (req, res, next) => {
    try {
        const courses = await Course.find()
            .populate('author', 'name')
            .sort('-createdAt');

        res.json({
            success: true,
            data: courses
        });
    } catch (error) {
        next(error);
    }
});

// 교육과정 게시 상태 변경
router.put('/courses/:id/publish', async (req, res, next) => {
    try {
        const { isPublished } = req.body;
        
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { isPublished },
            { new: true }
        );

        if (!course) {
            return res.status(404).json({
                success: false,
                message: '교육과정을 찾을 수 없습니다.'
            });
        }

        res.json({
            success: true,
            data: course
        });
    } catch (error) {
        next(error);
    }
});

// 퀴즈 관리
router.get('/quizzes', async (req, res, next) => {
    try {
        const quizzes = await Quiz.find()
            .populate('course', 'title')
            .sort('-createdAt');

        res.json({
            success: true,
            data: quizzes
        });
    } catch (error) {
        next(error);
    }
});

// 퀴즈 게시 상태 변경
router.put('/quizzes/:id/publish', async (req, res, next) => {
    try {
        const { isPublished } = req.body;
        
        const quiz = await Quiz.findByIdAndUpdate(
            req.params.id,
            { isPublished },
            { new: true }
        );

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: '퀴즈를 찾을 수 없습니다.'
            });
        }

        res.json({
            success: true,
            data: quiz
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

        const courseStats = await Course.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    totalDuration: { $sum: '$duration' }
                }
            }
        ]);

        const quizStats = await Quiz.aggregate([
            {
                $unwind: '$attempts'
            },
            {
                $group: {
                    _id: '$_id',
                    averageScore: { $avg: '$attempts.score' },
                    totalAttempts: { $sum: 1 },
                    passCount: {
                        $sum: {
                            $cond: [
                                { $gte: ['$attempts.score', '$passingScore'] },
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
                userStats: userStats[0],
                courseStats,
                quizStats
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router; 