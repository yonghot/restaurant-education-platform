const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const { generateToken, generateEmailVerificationToken, sendVerificationEmail } = require('../middleware/auth');
const { googleStrategy } = require('../middleware/auth');

// 회원가입
router.post('/register', async (req, res, next) => {
    try {
        const { email, password, name } = req.body;

        // 이메일 중복 확인
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: '이미 등록된 이메일입니다.'
            });
        }

        // 이메일 인증 토큰 생성
        const { token, expires } = generateEmailVerificationToken();

        // 새 사용자 생성
        const user = await User.create({
            email,
            password,
            name,
            emailVerificationToken: token,
            emailVerificationExpires: expires
        });

        // 인증 이메일 전송
        await sendVerificationEmail(email, token);

        res.status(201).json({
            success: true,
            message: '회원가입이 완료되었습니다. 이메일 인증을 진행해주세요.'
        });
    } catch (error) {
        next(error);
    }
});

// 이메일 인증
router.get('/verify-email/:token', async (req, res, next) => {
    try {
        const user = await User.findOne({
            emailVerificationToken: req.params.token,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않거나 만료된 인증 토큰입니다.'
            });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        res.json({
            success: true,
            message: '이메일 인증이 완료되었습니다.'
        });
    } catch (error) {
        next(error);
    }
});

// 로그인
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // 사용자 확인
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: '이메일 또는 비밀번호가 일치하지 않습니다.'
            });
        }

        // 이메일 인증 확인
        if (!user.isEmailVerified) {
            return res.status(401).json({
                success: false,
                message: '이메일 인증이 필요합니다.'
            });
        }

        // 비밀번호 확인
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: '이메일 또는 비밀번호가 일치하지 않습니다.'
            });
        }

        // 마지막 로그인 시간 업데이트
        user.lastLogin = new Date();
        await user.save();

        // 토큰 생성
        const token = generateToken(user);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
});

// Google OAuth 로그인
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth 콜백
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    async (req, res) => {
        try {
            const token = generateToken(req.user);
            res.redirect(`/auth-success?token=${token}`);
        } catch (error) {
            res.redirect('/login?error=google-auth-failed');
        }
    }
);

// Facebook OAuth 로그인
router.get('/facebook',
    passport.authenticate('facebook', { scope: ['email', 'public_profile'] })
);

// Facebook OAuth 콜백
router.get('/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    async (req, res) => {
        try {
            const token = generateToken(req.user);
            res.redirect(`/auth-success?token=${token}`);
        } catch (error) {
            res.redirect('/login?error=facebook-auth-failed');
        }
    }
);

// Kakao OAuth 로그인
router.get('/kakao',
    passport.authenticate('kakao')
);

// Kakao OAuth 콜백
router.get('/kakao/callback',
    passport.authenticate('kakao', { failureRedirect: '/login' }),
    async (req, res) => {
        try {
            const token = generateToken(req.user);
            res.redirect(`/auth-success?token=${token}`);
        } catch (error) {
            res.redirect('/login?error=kakao-auth-failed');
        }
    }
);

// 비밀번호 재설정 요청
router.post('/forgot-password', async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: '해당 이메일로 등록된 사용자가 없습니다.'
            });
        }

        // 비밀번호 재설정 토큰 생성
        const resetToken = generateToken(user);
        
        // 이메일 전송 로직 구현 필요
        // sendResetPasswordEmail(user.email, resetToken);

        res.json({
            success: true,
            message: '비밀번호 재설정 링크가 이메일로 전송되었습니다.'
        });
    } catch (error) {
        next(error);
    }
});

// 비밀번호 재설정
router.post('/reset-password', async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;

        // 토큰 검증
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: '유효하지 않은 토큰입니다.'
            });
        }

        // 새 비밀번호 설정
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: '비밀번호가 성공적으로 변경되었습니다.'
        });
    } catch (error) {
        next(error);
    }
});

// Naver OAuth 로그인
router.get('/naver',
    passport.authenticate('naver')
);

// Naver OAuth 콜백
router.get('/naver/callback',
    passport.authenticate('naver', { failureRedirect: '/login' }),
    async (req, res) => {
        try {
            const token = generateToken(req.user);
            res.redirect(`/auth-success?token=${token}`);
        } catch (error) {
            res.redirect('/login?error=naver-auth-failed');
        }
    }
);

// Apple OAuth 로그인
router.get('/apple',
    passport.authenticate('apple', { scope: ['name', 'email'] })
);

// Apple OAuth 콜백
router.get('/apple/callback',
    passport.authenticate('apple', { failureRedirect: '/login' }),
    async (req, res) => {
        try {
            const token = generateToken(req.user);
            res.redirect(`/auth-success?token=${token}`);
        } catch (error) {
            res.redirect('/login?error=apple-auth-failed');
        }
    }
);

module.exports = router; 