const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

// 환경변수 로드
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 보안 미들웨어
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
        },
    },
}));

// CORS 설정
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000'];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 기본 미들웨어
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 레이트 리미팅
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15분
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 최대 100요청
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', limiter);

// 정적 파일 서빙
app.use(express.static('.', {
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        } else if (path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000');
        }
    }
}));

// 로깅 미들웨어
app.use((req, res, next) => {
    if (process.env.VERBOSE_LOGGING === 'true') {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    }
    next();
});

// API 라우트들
app.use('/api/auth', require('./routes/auth.js'));
app.use('/api/news', require('./routes/news.js'));
app.use('/api/community', require('./routes/community.js'));
app.use('/api/download', require('./routes/download.js'));
app.use('/api/user', require('./routes/user.js'));

// 기본 API 상태 확인
app.get('/api/status', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

// HTML 파일 라우팅 (SPA 지원)
const htmlFiles = ['index.html', 'login.html', 'signup.html', 'gameinfo.html', 'news.html', 'community.html', 'download.html'];

htmlFiles.forEach(file => {
    const route = file === 'index.html' ? '/' : `/${file.replace('.html', '')}`;
    app.get(route, (req, res) => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            res.sendFile(filePath);
        } else {
            res.status(404).send('Page not found');
        }
    });
});

// 404 핸들러
app.use('*', (req, res) => {
    if (req.path.startsWith('/api')) {
        res.status(404).json({ error: 'API endpoint not found' });
    } else {
        // SPA의 경우 index.html로 리다이렉트
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

// 전역 에러 핸들러
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    if (process.env.NODE_ENV === 'development') {
        res.status(500).json({
            error: 'Internal Server Error',
            message: err.message,
            stack: err.stack
        });
    } else {
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Something went wrong!'
        });
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});

// 서버 시작
const server = app.listen(PORT, () => {
    console.log(`
🚀 RA Game Server is running!
    
📍 Local:            http://localhost:${PORT}
🌍 Environment:      ${process.env.NODE_ENV || 'development'}
📊 API Status:       http://localhost:${PORT}/api/status
🎮 Game Homepage:    http://localhost:${PORT}

Ready to serve the RA gaming community! 🎯
    `);
    
    if (process.env.NODE_ENV === 'development') {
        console.log('📁 Static files served from current directory');
        console.log('🔧 Development mode: Verbose logging enabled');
    }
});

module.exports = app;