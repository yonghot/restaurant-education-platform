const serverless = require('serverless-http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');

// 라우터 임포트
const authRoutes = require('../routes/auth');
const userRoutes = require('../routes/users');
const adminRoutes = require('../routes/admin');
const chatbotRoutes = require('../routes/chatbot');
const checklistRoutes = require('../routes/checklist');

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// MongoDB 연결 (서버리스 환경을 위한 최적화)
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }
  
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-education', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    });
    
    cachedDb = connection;
    console.log('MongoDB 연결 성공');
    return cachedDb;
  } catch (error) {
    console.error('MongoDB 연결 실패:', error);
    throw error;
  }
}

// API 라우트 설정
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/checklist', checklistRoutes);

// 헬스체크 엔드포인트
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: '서버 에러가 발생했습니다.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 서버리스 함수로 내보내기
exports.handler = async (event, context) => {
  // MongoDB 연결 확인
  try {
    await connectToDatabase();
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Database connection failed' })
    };
  }
  
  // serverless-http를 사용하여 Express 앱 처리
  const handler = serverless(app);
  return handler(event, context);
};