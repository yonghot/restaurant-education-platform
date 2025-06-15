const jwt = require('jsonwebtoken');
const User = require('../models/User');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const NaverStrategy = require('passport-naver').Strategy;
const AppleStrategy = require('passport-apple').Strategy;
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// JWT 토큰 검증 미들웨어
exports.protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: '인증이 필요합니다.'
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id);
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: '유효하지 않은 토큰입니다.'
            });
        }
    } catch (error) {
        next(error);
    }
};

// 관리자 권한 확인 미들웨어
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: '접근 권한이 없습니다.'
            });
        }
        next();
    };
};

// 이메일 인증 토큰 생성
exports.generateEmailVerificationToken = () => {
    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 24 * 60 * 60 * 1000; // 24시간
    return { token, expires };
};

// 이메일 전송 설정
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 이메일 인증 메일 전송
exports.sendVerificationEmail = async (email, token) => {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: '요알남 이메일 인증',
        html: `
            <h1>요알남 이메일 인증</h1>
            <p>아래 링크를 클릭하여 이메일 인증을 완료해주세요:</p>
            <a href="${verificationUrl}">이메일 인증하기</a>
            <p>이 링크는 24시간 동안 유효합니다.</p>
        `
    };

    await transporter.sendMail(mailOptions);
};

// 소셜 로그인 전략 설정
exports.configurePassport = () => {
    // Google OAuth 전략
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback'
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ googleId: profile.id });
            
            if (!user) {
                user = await User.create({
                    googleId: profile.id,
                    email: profile.emails[0].value,
                    name: profile.displayName,
                    profileImage: profile.photos[0].value,
                    isEmailVerified: true // Google 로그인은 이메일이 이미 인증된 상태
                });
            }
            
            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }));

    // Naver OAuth 전략
    passport.use(new NaverStrategy({
        clientID: process.env.NAVER_CLIENT_ID,
        clientSecret: process.env.NAVER_CLIENT_SECRET,
        callbackURL: '/api/auth/naver/callback'
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ naverId: profile.id });
            
            if (!user) {
                user = await User.create({
                    naverId: profile.id,
                    email: profile.emails[0].value,
                    name: profile.displayName,
                    profileImage: profile._json.profile_image,
                    isEmailVerified: true // Naver 로그인은 이메일이 이미 인증된 상태
                });
            }
            
            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }));

    // Apple OAuth 전략
    passport.use(new AppleStrategy({
        clientID: process.env.APPLE_CLIENT_ID,
        teamID: process.env.APPLE_TEAM_ID,
        keyID: process.env.APPLE_KEY_ID,
        privateKeyLocation: process.env.APPLE_PRIVATE_KEY_PATH,
        callbackURL: '/api/auth/apple/callback'
    }, async (req, accessToken, refreshToken, idToken, profile, done) => {
        try {
            let user = await User.findOne({ appleId: profile.id });
            
            if (!user) {
                user = await User.create({
                    appleId: profile.id,
                    email: profile.email,
                    name: profile.name.firstName + ' ' + profile.name.lastName,
                    isEmailVerified: true // Apple 로그인은 이메일이 이미 인증된 상태
                });
            }
            
            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
};

// JWT 토큰 생성
exports.generateToken = (user) => {
    return jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
}; 