# 🚀 배포 가이드

## 배포 옵션

### 1. Vercel (추천 - 무료 티어 제공)

#### 배포 단계:
1. [Vercel](https://vercel.com) 계정 생성
2. GitHub 저장소 연결
3. 환경 변수 설정:
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-api-key
PINECONE_API_KEY=your-api-key
PINECONE_ENVIRONMENT=your-environment
PINECONE_INDEX_NAME=your-index
```
4. Deploy 클릭

#### 커맨드라인 배포:
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

---

### 2. Railway (추천 - 쉬운 설정)

#### 배포 단계:
1. [Railway](https://railway.app) 계정 생성
2. New Project → Deploy from GitHub repo
3. 환경 변수 설정 (Railway 대시보드)
4. MongoDB Atlas 연결
5. 자동 배포 활성화

#### CLI 배포:
```bash
# Railway CLI 설치
npm i -g @railway/cli

# 로그인
railway login

# 프로젝트 초기화
railway init

# 배포
railway up
```

---

### 3. Render (무료 티어 제공)

#### 배포 단계:
1. [Render](https://render.com) 계정 생성
2. New → Web Service
3. GitHub 저장소 연결
4. 환경 변수 설정
5. Deploy

---

### 4. MongoDB Atlas 설정 (필수)

1. [MongoDB Atlas](https://www.mongodb.com/atlas) 계정 생성
2. 무료 클러스터 생성 (M0 Sandbox)
3. Database Access → 사용자 생성
4. Network Access → IP Whitelist 설정 (0.0.0.0/0 for all)
5. Connect → Connection String 복사

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/restaurant-education?retryWrites=true&w=majority
```

---

## 환경 변수 설정

모든 플랫폼에서 다음 환경 변수 필수:

```env
# 필수
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=generate_random_string_32chars
NODE_ENV=production

# API Keys
GEMINI_API_KEY=your_gemini_key
PINECONE_API_KEY=your_pinecone_key
PINECONE_ENVIRONMENT=gcp-starter
PINECONE_INDEX_NAME=your_index_name

# OAuth (선택)
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
```

---

## 배포 체크리스트

### 배포 전:
- [ ] MongoDB Atlas 클러스터 생성
- [ ] 환경 변수 설정
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] 프로덕션 빌드 테스트: `NODE_ENV=production npm start`

### 배포 후:
- [ ] 도메인 연결 (선택사항)
- [ ] SSL 인증서 확인
- [ ] 헬스체크 엔드포인트 테스트
- [ ] 로그 모니터링 설정
- [ ] 백업 정책 수립

---

## 도메인 연결

### Cloudflare (추천):
1. Cloudflare 계정 생성
2. 도메인 추가
3. DNS 설정:
   - Type: CNAME
   - Name: @ 또는 www
   - Target: 배포 플랫폼 URL

### SSL 설정:
- Vercel, Railway, Render: 자동 SSL
- Cloudflare: Flexible SSL 또는 Full SSL

---

## 모니터링

### 추천 도구:
- **Sentry**: 에러 트래킹
- **LogDNA**: 로그 관리
- **UptimeRobot**: 가동시간 모니터링
- **Google Analytics**: 사용자 분석

---

## 트러블슈팅

### 일반적인 문제:

#### 1. MongoDB 연결 실패
- IP Whitelist 확인 (0.0.0.0/0)
- Connection string 확인
- 네트워크 액세스 권한 확인

#### 2. 환경 변수 인식 실패
- 플랫폼별 환경 변수 설정 확인
- `.env` 파일 위치 확인
- `process.env` 접근 확인

#### 3. 포트 문제
- `process.env.PORT` 사용 확인
- 하드코딩된 포트 제거

#### 4. 정적 파일 서빙 실패
- Express static 미들웨어 설정 확인
- 경로 설정 확인

---

## 비용 최적화

### 무료 티어 활용:
- **Vercel**: 100GB 대역폭/월
- **Railway**: $5 크레딧/월
- **Render**: 750시간/월
- **MongoDB Atlas**: 512MB 스토리지
- **Cloudflare**: 무제한 대역폭

### 비용 절감 팁:
1. 이미지 최적화 (WebP 포맷)
2. CDN 활용
3. 캐싱 전략 구현
4. 불필요한 API 호출 줄이기

---

## 보안 권장사항

1. **환경 변수 보안**
   - 민감한 정보는 절대 코드에 포함하지 않기
   - 강력한 JWT Secret 사용

2. **API 보안**
   - Rate limiting 구현
   - CORS 적절히 설정
   - Input validation

3. **데이터베이스 보안**
   - 최소 권한 원칙
   - 정기 백업
   - 연결 암호화

4. **모니터링**
   - 실시간 에러 알림
   - 비정상 트래픽 감지
   - 정기 보안 업데이트

---

## 연락처

문제 발생 시:
- Email: contact@yoalnam.com
- GitHub Issues: [저장소 링크]

---

*Last Updated: 2025-01-13*