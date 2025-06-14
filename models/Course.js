const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['기본', '메뉴', '인사관리', '재고관리', '마케팅', '기타']
    },
    level: {
        type: String,
        required: true,
        enum: ['초급', '중급', '고급']
    },
    duration: {
        type: Number, // 예상 학습 시간 (분)
        required: true
    },
    thumbnail: {
        type: String,
        default: 'default-course.jpg'
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quizzes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        text: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    tags: [{
        type: String,
        trim: true
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
courseSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// 댓글 추가 메서드
courseSchema.methods.addComment = async function(userId, text) {
    this.comments.push({
        user: userId,
        text
    });
    return this.save();
};

// 퀴즈 추가 메서드
courseSchema.methods.addQuiz = async function(quizId) {
    if (!this.quizzes.includes(quizId)) {
        this.quizzes.push(quizId);
        return this.save();
    }
    return this;
};

// 검색 메서드
courseSchema.statics.search = async function(query) {
    return this.find({
        $or: [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { tags: { $regex: query, $options: 'i' } }
        ],
        isPublished: true
    }).populate('author', 'name');
};

module.exports = mongoose.model('Course', courseSchema); 