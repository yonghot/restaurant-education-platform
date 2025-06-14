const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: function() {
            return !this.googleId; // Google 로그인의 경우 비밀번호 불필요
        }
    },
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    googleId: String,
    profileImage: String,
    learningProgress: [{
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        },
        completed: {
            type: Boolean,
            default: false
        },
        lastAccessed: Date,
        quizScores: [{
            quizId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Quiz'
            },
            score: Number,
            completedAt: Date
        }]
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: Date
});

// 비밀번호 해싱
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// 비밀번호 검증 메서드
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// 학습 진행도 업데이트 메서드
userSchema.methods.updateLearningProgress = async function(courseId, completed = false) {
    const progress = this.learningProgress.find(p => p.courseId.toString() === courseId.toString());
    
    if (progress) {
        progress.completed = completed;
        progress.lastAccessed = new Date();
    } else {
        this.learningProgress.push({
            courseId,
            completed,
            lastAccessed: new Date()
        });
    }
    
    return this.save();
};

// 퀴즈 점수 업데이트 메서드
userSchema.methods.updateQuizScore = async function(courseId, quizId, score) {
    const progress = this.learningProgress.find(p => p.courseId.toString() === courseId.toString());
    
    if (progress) {
        const quizScore = progress.quizScores.find(q => q.quizId.toString() === quizId.toString());
        
        if (quizScore) {
            quizScore.score = score;
            quizScore.completedAt = new Date();
        } else {
            progress.quizScores.push({
                quizId,
                score,
                completedAt: new Date()
            });
        }
        
        return this.save();
    }
    
    throw new Error('Course progress not found');
};

module.exports = mongoose.model('User', userSchema); 