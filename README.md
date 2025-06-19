# 요알남 외식업 교육 플랫폼

외식업 창업과 운영에 대한 교육 콘텐츠를 제공하는 웹 플랫폼입니다.

## 🚀 배포 방법

### Netlify 배포 (권장)

1. **GitHub에 코드 푸시**
   ```bash
   git add .
   git commit -m "배포 준비 완료"
   git push origin main
   ```

2. **Netlify에서 배포**
   - [Netlify](https://netlify.com)에 로그인
   - "New site from Git" 클릭
   - GitHub 저장소 연결
   - 빌드 설정:
     - Build command: (비워두기)
     - Publish directory: `public`
   - 환경 변수 설정 (선택사항):
     - `GEMINI_API_KEY`: Google Gemini API 키
     - `PINECONE_API_KEY`: Pinecone API 키
   - "Deploy site" 클릭

### 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

## 📁 프로젝트 구조

```
├── public/                 # 정적 파일 (배포 대상)
│   ├── index.html         # 메인 페이지
│   ├── chatbot.html       # AI 챗봇 페이지
│   ├── infographics.html  # 인포그래픽 목록 페이지
│   ├── infographics/      # 개별 인포그래픽 파일들
│   ├── css/              # 스타일시트
│   ├── js/               # 자바스크립트 파일들
│   └── images/           # 이미지 파일들
├── functions/            # Netlify Functions
│   ├── api.js           # 챗봇 API
│   └── package.json     # Functions 의존성
├── routes/              # Express 라우트 (로컬 개발용)
├── netlify.toml         # Netlify 배포 설정
├── package.json         # 프로젝트 의존성
└── README.md           # 프로젝트 문서
```

## 🎯 주요 기능

- 📊 **인포그래픽**: 외식업 관련 시각적 데이터 분석
- 🤖 **AI 챗봇**: 외식업 전문 지식 기반 질의응답
- 📚 **자동 데이터 로딩**: data 폴더의 텍스트 파일 자동 학습

## 🤖 AI 챗봇 기능

### 기능 특징
- **실시간 대화**: 외식업 관련 질문에 즉시 답변
- **전문 지식**: 전자책, Q&A, 보고서 기반 지식 제공
- **키워드 기반 검색**: 관련 지식을 빠르게 찾아 답변
- **친근한 톤**: 초보자도 이해하기 쉬운 설명

### 지원 주제
- 외식업 창업 가이드
- 비용 관리 및 원가 계산
- 메뉴 구성 및 가격 설정
- 마케팅 전략
- 인력 관리
- 에너지 비용 절약
- 식품위생 관리
- 칼국수 전문점 운영

### 기술 스택
- **AI 모델**: Google Gemini API
- **벡터 데이터베이스**: Pinecone (선택사항)
- **프론트엔드**: HTML, CSS, JavaScript
- **백엔드**: Netlify Functions

## 🔧 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript
- **UI Framework**: Bootstrap 5
- **Charts**: Chart.js
- **AI**: Google Gemini API
- **Vector DB**: Pinecone (선택사항)
- **Deployment**: Netlify
- **Styling**: Tailwind CSS (인포그래픽)

## 📊 인포그래픽 목록

1. **칼국수 전문점 에너지 비용 비교** - 가스레인지 vs 인덕션 월간 비용 분석
2. **외식업 성공 전략 가이드** - 창업부터 운영까지 핵심 전략
3. **경기 침체기 외식업 트렌드** - 소비자 행동 변화와 대응 방안
4. **에너지 비용 비교 분석** - 다양한 조리 기기 효율성 비교
5. **인덕션 vs 하이라이트 비교** - 성능, 비용, 안전성 종합 분석

## 🔑 API 키 설정 (선택사항)

AI 챗봇의 고급 기능을 사용하려면 다음 API 키를 설정하세요:

1. **Google Gemini API 키**
   - [Google AI Studio](https://makersuite.google.com/app/apikey)에서 발급
   - Netlify 환경 변수에 `GEMINI_API_KEY`로 설정

2. **Pinecone API 키** (벡터 검색용)
   - [Pinecone](https://www.pinecone.io/)에서 발급
   - Netlify 환경 변수에 `PINECONE_API_KEY`로 설정

API 키가 설정되지 않아도 기본 응답 기능은 정상 작동합니다.

## 🌐 배포 URL

배포가 완료되면 Netlify에서 제공하는 URL로 접근할 수 있습니다.

## 📝 라이선스

이 프로젝트는 교육 목적으로 제작되었습니다.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request 

---
*Last updated: 2024-12-19* 