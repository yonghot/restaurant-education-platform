# 요알남 외식업 교육 플랫폼

외식업 창업과 운영에 필요한 핵심 정보를 제공하는 교육 플랫폼입니다.

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
│   ├── infographics.html  # 인포그래픽 목록 페이지
│   ├── infographics/      # 개별 인포그래픽 파일들
│   ├── css/              # 스타일시트
│   ├── js/               # 자바스크립트 파일들
│   └── images/           # 이미지 파일들
├── netlify.toml          # Netlify 배포 설정
├── package.json          # 프로젝트 의존성
└── README.md            # 프로젝트 문서
```

## 🎯 주요 기능

- **인포그래픽 갤러리**: 외식업 관련 시각적 자료 제공
- **에너지 비용 비교**: 가스레인지 vs 인덕션 비용 분석
- **창업 전략 가이드**: 외식업 성공 전략
- **시장 트렌드 분석**: 경기 침체기 대응 방안
- **장비 비교**: 주방 장비 성능 및 비용 비교

## 🔧 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript
- **UI Framework**: Bootstrap 5
- **Charts**: Chart.js
- **Deployment**: Netlify
- **Styling**: Tailwind CSS (인포그래픽)

## 📊 인포그래픽 목록

1. **칼국수 전문점 에너지 비용 비교** - 가스레인지 vs 인덕션 월간 비용 분석
2. **외식업 성공 전략 가이드** - 창업부터 운영까지 핵심 전략
3. **경기 침체기 외식업 트렌드** - 소비자 행동 변화와 대응 방안
4. **에너지 비용 비교 분석** - 다양한 조리 기기 효율성 비교
5. **인덕션 vs 하이라이트 비교** - 성능, 비용, 안전성 종합 분석

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