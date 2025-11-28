const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

// GET /api/news/list - 소식 목록 조회
router.get('/list', newsController.getNewsList);

// GET /api/news/:id - 소식 상세 조회
router.get('/:id', newsController.getNewsById);

module.exports = router;