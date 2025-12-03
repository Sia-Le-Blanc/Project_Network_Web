# 🎮 RA Game - Official Website

RA 게임의 공식 홈페이지입니다. MMORPG 게임 소개, 뉴스, 커뮤니티, 다운로드 기능을 제공하는 웹사이트입니다.

## 📋 프로젝트 개요

- **프로젝트명**: RA Game Website
- **버전**: 1.0.0
- **개발 기간**: 2025년 12월
- **기술 스택**: HTML5, CSS3, JavaScript (ES6+), Node.js, Express, PostgreSQL

## 🚀 주요 기능

### 🎯 프론트엔드
- **홈페이지**: 게임 소개 및 주요 기능 안내
- **게임소개**: 스토리, 클래스, 시스템 소개
- **소식**: 업데이트, 이벤트, 패치노트
- **커뮤니티**: 게시판, 인기글, 검색 기능
- **다운로드**: 플랫폼별 게임 다운로드
- **로그인/회원가입**: 사용자 인증 시스템

### ⚙️ 백엔드 
- **인증 API**: JWT 기반 로그인/회원가입
- **뉴스 API**: 게시글 CRUD, 카테고리 필터링
- **커뮤니티 API**: 게시판 기능, 댓글, 검색
- **사용자 API**: 프로필 관리, 권한 제어
- **다운로드 API**: 파일 통계, 플랫폼 감지

## 📁 프로젝트 구조

```
Project_Network_Web/
├── 📄 index.html              # 홈페이지
├── 📄 login.html              # 로그인 페이지
├── 📄 signup.html             # 회원가입 페이지
├── 📄 gameinfo.html           # 게임소개 페이지
├── 📄 news.html               # 뉴스 페이지
├── 📄 community.html          # 커뮤니티 페이지
├── 📄 download.html           # 다운로드 페이지
│
├── 📂 assets/                 # 정적 자원
│   ├── 📂 css/               # 스타일시트
│   │   ├── common.css        # 공통 스타일
│   │   ├── index.css         # 홈페이지 스타일
│   │   ├── auth.css          # 인증 페이지 스타일
│   │   ├── gameinfo.css      # 게임소개 스타일
│   │   ├── news.css          # 뉴스 페이지 스타일
│   │   ├── community.css     # 커뮤니티 스타일
│   │   └── download.css      # 다운로드 스타일
│   │
│   └── 📂 js/                # JavaScript
│       ├── common.js         # 공통 기능 + API 클라이언트
│       ├── auth.js           # 로그인/회원가입 로직
│       ├── news.js           # 뉴스 페이지 로직
│       ├── community.js      # 커뮤니티 로직
│       └── download.js       # 다운로드 로직
│
├── 📂 routes/                # API 라우터 (생성 예정)
│   ├── auth.js               # 인증 관련 API
│   ├── news.js               # 뉴스 관련 API
│   ├── community.js          # 커뮤니티 API
│   ├── download.js           # 다운로드 API
│   └── user.js               # 사용자 관리 API
│
├── 📂 middleware/            # Express 미들웨어 (생성 예정)
├── 📂 models/                # 데이터베이스 모델 (생성 예정)
├── 📂 utils/                 # 유틸리티 함수 (생성 예정)
├── 📂 uploads/               # 파일 업로드 디렉터리
│
├── 📄 server.js              # Express 서버 메인 파일
├── 📄 package.json           # Node.js 의존성 관리
├── 📄 .env                   # 환경변수 설정
└── 📄 README.md              # 프로젝트 문서
```

## 🛠️ 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경변수 설정
`.env` 파일을 열어 필요한 설정을 입력하세요:

```env
# 데이터베이스 정보
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ra_game_db
DB_USER=your_username
DB_PASSWORD=your_password

# JWT 시크릿 (32자 이상 권장)
JWT_SECRET=your_super_secure_jwt_secret_key
```

### 3. 데이터베이스 설정
PostgreSQL 데이터베이스를 생성하고 테이블을 설정하세요.

### 4. 서버 실행

#### 개발 모드
```bash
npm run dev
```

#### 프로덕션 모드
```bash
npm start
```

### 5. 접속
브라우저에서 `http://localhost:3000` 에 접속하세요.

## 🎨 디자인 시스템

### 🎨 색상 팔레트
- **Primary**: `#e94560` (핑크)
- **Secondary**: `#ff6b6b` (오렌지)
- **Background**: `#0a0a0a` (다크)
- **Surface**: `#1a1a2e`, `#16213e` (그라데이션)
- **Text**: `#ffffff` (화이트), `#cccccc` (그레이)

### 🔤 타이포그래피
- **Font Family**: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- **Headings**: 42px ~ 72px (굵게)
- **Body Text**: 16px ~ 20px
- **Small Text**: 14px ~ 15px

### 📐 레이아웃
- **Max Width**: 1200px (데스크탑)
- **Padding**: 80px (섹션), 20px (모바일)
- **Border Radius**: 15px ~ 20px
- **Transitions**: 0.3s ease

## 🔧 API 명세

### 🔐 인증 API
```
POST /api/auth/login       # 로그인
POST /api/auth/signup      # 회원가입
POST /api/auth/logout      # 로그아웃
POST /api/auth/refresh     # 토큰 갱신
```

### 📰 뉴스 API
```
GET  /api/news             # 뉴스 목록
GET  /api/news/:id         # 뉴스 상세
POST /api/news             # 뉴스 작성 (관리자)
PUT  /api/news/:id         # 뉴스 수정 (관리자)
DELETE /api/news/:id       # 뉴스 삭제 (관리자)
```

### 💬 커뮤니티 API
```
GET  /api/community/posts           # 게시글 목록
GET  /api/community/posts/:id       # 게시글 상세
POST /api/community/posts           # 게시글 작성
PUT  /api/community/posts/:id       # 게시글 수정
DELETE /api/community/posts/:id     # 게시글 삭제
GET  /api/community/popular         # 인기 게시글
```

### 📥 다운로드 API
```
GET  /api/download/stats            # 다운로드 통계
POST /api/download/start            # 다운로드 시작
POST /api/download/track            # 다운로드 추적
```

## 🚧 개발 현황

### ✅ 완료된 기능
- [x] 프론트엔드 HTML/CSS/JS 모듈화
- [x] 반응형 디자인 구현
- [x] API 클라이언트 구조 설계
- [x] Express 서버 기본 설정
- [x] 환경변수 설정
- [x] 정적 파일 서빙

### 🔄 진행 예정
- [ ] 데이터베이스 스키마 설계
- [ ] API 라우터 구현
- [ ] JWT 인증 시스템
- [ ] 파일 업로드 기능
- [ ] 이메일 인증 시스템
- [ ] 관리자 패널

## 📝 커밋 컨벤션

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 스타일 변경
refactor: 코드 리팩터링
test: 테스트 추가/수정
chore: 빌드 설정 등
```

## 🤝 기여 방법

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 👥 개발팀

- **Frontend Developer**: 프론트엔드 개발
- **Backend Developer**: 백엔드 API 개발
- **UI/UX Designer**: 디자인 시스템 설계
- **DevOps Engineer**: 배포 및 운영

## 📞 문의

- **Email**: contact@ra-game.com
- **Discord**: [RA Game Community](https://discord.gg/ragame)
- **GitHub**: [RA Game Repository](https://github.com/ra-game/website)

---

**🎮 RA Game에서 새로운 전설을 써내려가세요! 🏆**