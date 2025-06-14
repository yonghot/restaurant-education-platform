const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    questions: [{
        question: {
            type: String,
            required: true
        },
        options: [{
            type: String,
            required: true
        }],
        correctAnswer: {
            type: Number,
            required: true
        },
        explanation: {
            type: String,
            required: true
        }
    }],
    timeLimit: {
        type: Number, // 분 단위
        default: 10
    },
    passingScore: {
        type: Number,
        default: 70
    },
    attempts: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        score: {
            type: Number,
            required: true
        },
        answers: [{
            questionIndex: Number,
            selectedOption: Number,
            isCorrect: Boolean
        }],
        completedAt: {
            type: Date,
            default: Date.now
        }
    }],
    isPublished: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// 업데이트 시간 자동 갱신
quizSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// 퀴즈 시도 추가 메서드
quizSchema.methods.addAttempt = async function(userId, score, answers) {
    this.attempts.push({
        user: userId,
        score,
        answers,
        completedAt: new Date()
    });
    return this.save();
};

// 퀴즈 통계 계산 메서드
quizSchema.methods.getStatistics = function() {
    const totalAttempts = this.attempts.length;
    if (totalAttempts === 0) {
        return {
            averageScore: 0,
            passRate: 0,
            totalAttempts: 0
        };
    }

    const totalScore = this.attempts.reduce((sum, attempt) => sum + attempt.score, 0);
    const passCount = this.attempts.filter(attempt => attempt.score >= this.passingScore).length;

    return {
        averageScore: totalScore / totalAttempts,
        passRate: (passCount / totalAttempts) * 100,
        totalAttempts
    };
};

// 답안 검증 메서드
quizSchema.methods.validateAnswers = function(answers) {
    return answers.map((answer, index) => {
        const question = this.questions[index];
        return {
            questionIndex: index,
            selectedOption: answer,
            isCorrect: answer === question.correctAnswer
        };
    });
};

// 점수 계산 메서드
quizSchema.methods.calculateScore = function(answers) {
    const validatedAnswers = this.validateAnswers(answers);
    const correctCount = validatedAnswers.filter(answer => answer.isCorrect).length;
    return (correctCount / this.questions.length) * 100;
};

module.exports = mongoose.model('Quiz', quizSchema); 