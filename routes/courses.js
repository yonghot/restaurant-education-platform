const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// 파일 업로드 설정
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/uploads/courses');
    },
    filename: function(req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function(req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
});

// 모든 교육과정 조회
router.get('/', async (req, res, next) => {
    try {
        const { category, level, search } = req.query;
        let query = { isPublished: true };

        if (category) query.category = category;
        if (level) query.level = level;
        if (search) {
            const courses = await Course.search(search);
            return res.json({
                success: true,
                data: courses
            });
        }

        const courses = await Course.find(query)
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

// 단일 교육과정 조회
router.get('/:id', async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('author', 'name')
            .populate('quizzes')
            .populate('comments.user', 'name');

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

// 교육과정 생성 (관리자만)
router.post('/', protect, authorize('admin'), upload.single('thumbnail'), async (req, res, next) => {
    try {
        const courseData = {
            ...req.body,
            author: req.user._id,
            thumbnail: req.file ? `/uploads/courses/${req.file.filename}` : undefined
        };

        const course = await Course.create(courseData);

        res.status(201).json({
            success: true,
            data: course
        });
    } catch (error) {
        next(error);
    }
});

// 교육과정 수정 (관리자만)
router.put('/:id', protect, authorize('admin'), upload.single('thumbnail'), async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: '교육과정을 찾을 수 없습니다.'
            });
        }

        const updateData = { ...req.body };
        if (req.file) {
            updateData.thumbnail = `/uploads/courses/${req.file.filename}`;
        }

        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            data: updatedCourse
        });
    } catch (error) {
        next(error);
    }
});

// 교육과정 삭제 (관리자만)
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: '교육과정을 찾을 수 없습니다.'
            });
        }

        await course.remove();

        res.json({
            success: true,
            message: '교육과정이 삭제되었습니다.'
        });
    } catch (error) {
        next(error);
    }
});

// 댓글 추가
router.post('/:id/comments', protect, async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: '교육과정을 찾을 수 없습니다.'
            });
        }

        await course.addComment(req.user._id, req.body.text);

        res.status(201).json({
            success: true,
            message: '댓글이 추가되었습니다.'
        });
    } catch (error) {
        next(error);
    }
});

// 댓글 삭제
router.delete('/:id/comments/:commentId', protect, async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: '교육과정을 찾을 수 없습니다.'
            });
        }

        const comment = course.comments.id(req.params.commentId);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: '댓글을 찾을 수 없습니다.'
            });
        }

        // 댓글 작성자 또는 관리자만 삭제 가능
        if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: '댓글을 삭제할 권한이 없습니다.'
            });
        }

        comment.remove();
        await course.save();

        res.json({
            success: true,
            message: '댓글이 삭제되었습니다.'
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router; 