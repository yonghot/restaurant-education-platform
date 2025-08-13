# 요알남 플랫폼 개발 가이드라인

## 🎯 프로젝트 개요
요알남(요식업을 알려주는 남자)은 외식업 창업과 운영을 위한 종합 교육 플랫폼입니다.

### 핵심 기능
- 📊 **인포그래픽**: 외식업 트렌드와 데이터 시각화
- 🤖 **AI 챗봇**: 외식업 전문 지식 Q&A
- 🧮 **창업 계산기**: 투자금 계산 및 손익분석
- ✅ **체크리스트**: 사업가 기질 진단 도구

## 🏗️ 아키텍처

### 기술 스택
- **Backend**: Node.js, Express.js, MongoDB
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **API**: RESTful API
- **Authentication**: JWT, OAuth 2.0
- **AI**: Google Gemini API
- **Database**: MongoDB with Mongoose ODM

### 디렉토리 구조
```
/
├── public/           # 정적 파일 및 프론트엔드
│   ├── css/         # 스타일시트
│   ├── js/          # 클라이언트 JavaScript
│   ├── infographics/# 인포그래픽 페이지
│   └── calculator/  # 계산기 모듈
├── routes/          # API 라우트
├── models/          # MongoDB 스키마
├── functions/       # 서버리스 함수
└── middleware/      # Express 미들웨어
```

## 🎨 디자인 시스템 (Linear.app 기반)

### 색상 팔레티
```css
:root {
  /* Primary Colors */
  --color-bg-primary: #09090b;        /* 주 배경 */
  --color-bg-secondary: #18181b;      /* 카드 배경 */
  --color-bg-tertiary: #27272a;       /* 호버 상태 */
  
  /* Text Colors */
  --color-text-primary: #fafafa;      /* 주 텍스트 */
  --color-text-secondary: #a1a1aa;    /* 보조 텍스트 */
  --color-text-tertiary: #71717a;     /* 비활성 텍스트 */
  
  /* Accent Colors */
  --color-accent-blue: #3b82f6;       /* 주요 액션 */
  --color-accent-green: #22c55e;      /* 성공 상태 */
  --color-accent-red: #ef4444;        /* 오류 상태 */
  --color-accent-orange: #f97316;     /* 경고 상태 */
  
  /* Border Colors */
  --color-border-primary: #27272a;    /* 기본 테두리 */
  --color-border-secondary: #3f3f46;  /* 강조 테두리 */
}
```

### 타이포그래피
```css
:root {
  /* Font Family */
  --font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-family-mono: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
  
  /* Font Sizes */
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */
  
  /* Font Weights */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  /* Line Heights */
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
}
```

### 간격 시스템
```css
:root {
  /* Spacing Scale */
  --spacing-0: 0;
  --spacing-1: 0.25rem;   /* 4px */
  --spacing-2: 0.5rem;    /* 8px */
  --spacing-3: 0.75rem;   /* 12px */
  --spacing-4: 1rem;      /* 16px */
  --spacing-5: 1.25rem;   /* 20px */
  --spacing-6: 1.5rem;    /* 24px */
  --spacing-8: 2rem;      /* 32px */
  --spacing-10: 2.5rem;   /* 40px */
  --spacing-12: 3rem;     /* 48px */
  --spacing-16: 4rem;     /* 64px */
  --spacing-20: 5rem;     /* 80px */
}
```

### 애니메이션
```css
:root {
  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Easing Functions */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

## 📦 코드 규칙

### 모듈화 원칙
1. **단일 책임 원칙**: 각 모듈은 하나의 기능만 담당
2. **독립성**: 모듈 간 느슨한 결합 유지
3. **재사용성**: 공통 기능은 유틸리티로 분리
4. **테스트 가능성**: 각 모듈은 독립적으로 테스트 가능

### 파일 명명 규칙
- **컴포넌트**: PascalCase (예: `UserProfile.js`)
- **유틸리티**: camelCase (예: `formatDate.js`)
- **스타일**: kebab-case (예: `main-layout.css`)
- **라우트**: kebab-case (예: `user-profile.js`)

### API 엔드포인트 규칙
```javascript
// RESTful 패턴
GET    /api/users          // 목록 조회
GET    /api/users/:id      // 단일 조회
POST   /api/users          // 생성
PUT    /api/users/:id      // 전체 수정
PATCH  /api/users/:id      // 부분 수정
DELETE /api/users/:id      // 삭제
```

### 에러 처리
```javascript
// 표준 에러 응답 형식
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "사용자 친화적 메시지",
    "details": {} // 개발 모드에서만
  }
}
```

## 🔒 보안 가이드라인

### 인증/인가
- JWT 토큰 사용 (유효기간: 24시간)
- Refresh Token 구현 (유효기간: 7일)
- Role-based Access Control (RBAC)

### 데이터 검증
- 모든 입력값 서버 측 검증
- SQL Injection 방지 (Mongoose 사용)
- XSS 방지 (입력값 이스케이프)
- CSRF 토큰 구현

### 환경 변수
```env
# 필수 환경 변수
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://...
JWT_SECRET=...
GEMINI_API_KEY=...
```

## 🚀 성능 최적화

### 프론트엔드
1. **번들 최적화**
   - Code splitting
   - Tree shaking
   - Lazy loading
   
2. **캐싱 전략**
   - Service Worker 구현
   - Browser caching headers
   - CDN 활용

3. **이미지 최적화**
   - WebP 포맷 사용
   - Lazy loading
   - Responsive images

### 백엔드
1. **데이터베이스**
   - 인덱싱 최적화
   - Query 최적화
   - Connection pooling

2. **API 최적화**
   - Response compression
   - Rate limiting
   - Caching (Redis)

## 📝 커밋 컨벤션

### 커밋 메시지 형식
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅
- `refactor`: 리팩토링
- `perf`: 성능 개선
- `test`: 테스트 추가
- `chore`: 빌드 업무, 패키지 매니저 설정

### 예시
```
feat(chatbot): AI 응답 속도 개선

- 캐싱 메커니즘 구현
- 응답 시간 50% 단축
- 메모리 사용량 최적화

Closes #123
```

## 🔄 개발 워크플로우

### 브랜치 전략
```
main
├── develop
│   ├── feature/feature-name
│   ├── fix/bug-name
│   └── refactor/component-name
└── hotfix/critical-fix
```

### 코드 리뷰 체크리스트
- [ ] 코드가 요구사항을 충족하는가?
- [ ] 테스트가 작성되었는가?
- [ ] 문서가 업데이트되었는가?
- [ ] 성능 영향을 고려했는가?
- [ ] 보안 이슈는 없는가?
- [ ] 코드 스타일 가이드를 준수했는가?

## 🧪 테스트 가이드

### 테스트 구조
```javascript
describe('Component/Function Name', () => {
  beforeEach(() => {
    // 설정
  });
  
  it('should do something specific', () => {
    // 준비 (Arrange)
    // 실행 (Act)
    // 검증 (Assert)
  });
  
  afterEach(() => {
    // 정리
  });
});
```

### 테스트 커버리지 목표
- Unit Tests: 80% 이상
- Integration Tests: 60% 이상
- E2E Tests: Critical paths

## 📊 모니터링

### 로깅 레벨
```javascript
// 로그 레벨 (우선순위 순)
logger.error()   // 시스템 오류
logger.warn()    // 경고 상황
logger.info()    // 일반 정보
logger.debug()   // 디버깅 정보
logger.trace()   // 상세 추적
```

### 메트릭 수집
- 응답 시간
- 에러율
- 동시 사용자 수
- 데이터베이스 쿼리 시간
- 메모리 사용량

## 🚨 트러블슈팅

### 일반적인 문제 해결
1. **MongoDB 연결 실패**
   - 연결 문자열 확인
   - 네트워크 설정 확인
   - 방화벽 규칙 확인

2. **JWT 인증 오류**
   - 토큰 만료 시간 확인
   - Secret key 일치 여부
   - 토큰 형식 검증

3. **CORS 에러**
   - Origin 설정 확인
   - Credentials 설정
   - Preflight 요청 처리

## 📚 참고 자료

### 외부 문서
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Linear Design System](https://linear.app)
- [Google Gemini API](https://ai.google.dev/)

### 내부 문서
- [API 명세서](/docs/api.md)
- [데이터베이스 스키마](/docs/schema.md)
- [배포 가이드](/docs/deployment.md)

---

*Last Updated: 2025-01-13*
*Version: 1.0.0*