const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const Course = require('../models/Course');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// 모든 퀴즈 조회
router.get('/', async (req, res, next) => {
    try {
        const { courseId } = req.query;
        let query = { isPublished: true };

        if (courseId) {
            query.course = courseId;
        }

        const quizzes = await Quiz.find(query)
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

// 단일 퀴즈 조회
router.get('/:id', async (req, res, next) => {
    try {
        const quiz = await Quiz.findById(req.params.id)
            .populate('course', 'title')
            .populate('attempts.user', 'name');

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

// 퀴즈 생성 (관리자만)
router.post('/', protect, authorize('admin'), async (req, res, next) => {
    try {
        const quiz = await Quiz.create({
            ...req.body,
            course: req.body.courseId
        });

        // 교육과정에 퀴즈 추가
        await Course.findByIdAndUpdate(
            req.body.courseId,
            { $push: { quizzes: quiz._id } }
        );

        res.status(201).json({
            success: true,
            data: quiz
        });
    } catch (error) {
        next(error);
    }
});

// 퀴즈 수정 (관리자만)
router.put('/:id', protect, authorize('admin'), async (req, res, next) => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: '퀴즈를 찾을 수 없습니다.'
            });
        }

        const updatedQuiz = await Quiz.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            data: updatedQuiz
        });
    } catch (error) {
        next(error);
    }
});

// 퀴즈 삭제 (관리자만)
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: '퀴즈를 찾을 수 없습니다.'
            });
        }

        // 교육과정에서 퀴즈 제거
        await Course.findByIdAndUpdate(
            quiz.course,
            { $pull: { quizzes: quiz._id } }
        );

        await quiz.remove();

        res.json({
            success: true,
            message: '퀴즈가 삭제되었습니다.'
        });
    } catch (error) {
        next(error);
    }
});

// 퀴즈 제출
router.post('/:id/submit', protect, async (req, res, next) => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: '퀴즈를 찾을 수 없습니다.'
            });
        }

        const { answers } = req.body;
        const score = quiz.calculateScore(answers);
        const validatedAnswers = quiz.validateAnswers(answers);

        // 퀴즈 시도 기록
        await quiz.addAttempt(req.user._id, score, validatedAnswers);

        // 사용자의 학습 진행도 업데이트
        await req.user.updateQuizScore(quiz.course, quiz._id, score);

        res.json({
            success: true,
            data: {
                score,
                answers: validatedAnswers,
                passed: score >= quiz.passingScore
            }
        });
    } catch (error) {
        next(error);
    }
});

// 퀴즈 통계 조회
router.get('/:id/statistics', protect, authorize('admin'), async (req, res, next) => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: '퀴즈를 찾을 수 없습니다.'
            });
        }

        const statistics = quiz.getStatistics();

        res.json({
            success: true,
            data: statistics
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router; 