// news.js - 소식 페이지 전용 스크립트

let currentPage = 1;
let currentCategory = '전체';
const itemsPerPage = 10;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initNewsPage();
});

// 소식 페이지 초기화
async function initNewsPage() {
    try {
        // 추천 소식 로딩
        await loadFeaturedNews();
        
        // 소식 목록 로딩
        await loadNewsList(currentPage, currentCategory);
        
        // 필터 탭 이벤트 등록
        initFilterTabs();
        
    } catch (error) {
        console.error('소식 페이지 초기화 오류:', error);
        showError('소식을 불러오는 중 오류가 발생했습니다.');
    }
}

// 추천 소식 로딩
async function loadFeaturedNews() {
    try {
        // 임시 추천 소식 데이터 (실제로는 API에서 로딩)
        const featuredNewsHtml = `
            <div class="featured-news">
                <div class="featured-content">
                    <div class="featured-image">🎉</div>
                    <div class="featured-text">
                        <span class="featured-badge">🔥 HOT</span>
                        <h2>시즌 3 '영원의 전쟁' 대규모 업데이트!</h2>
                        <p>
                            역대 최대 규모의 업데이트가 찾아옵니다. 새로운 대륙 '아케론', 
                            전설 등급 장비 시스템, 그리고 50vs50 대규모 전장까지! 
                            12월 1일 대규모 업데이트를 기대해주세요.
                        </p>
                        <a href="#" class="read-more">자세히 보기 →</a>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('featuredNews').innerHTML = featuredNewsHtml;
        
        // 실제 API 호출 예시 (백엔드 구현 후 활성화)
        /*
        const response = await api.getNewsList(1, 1, '전체');
        if (response.success && response.data.news.length > 0) {
            const featured = response.data.news.find(news => news.featured);
            if (featured) {
                renderFeaturedNews(featured);
            }
        }
        */
        
    } catch (error) {
        console.error('추천 소식 로딩 오류:', error);
    }
}

// 소식 목록 로딩
async function loadNewsList(page = 1, category = '전체') {
    try {
        showLoading(true);
        
        // 임시 소식 데이터 (실제로는 API에서 로딩)
        const mockNews = generateMockNews(page, category);
        
        renderNewsList(mockNews.news);
        renderPagination(mockNews.pagination);
        
        // 실제 API 호출 (백엔드 구현 후 활성화)
        /*
        const response = await api.getNewsList(page, itemsPerPage, category);
        if (response.success) {
            renderNewsList(response.data.news);
            renderPagination(response.data.pagination);
        } else {
            throw new Error('소식 데이터를 불러올 수 없습니다.');
        }
        */
        
    } catch (error) {
        console.error('소식 목록 로딩 오류:', error);
        showError('소식을 불러오는 중 오류가 발생했습니다.');
    } finally {
        showLoading(false);
    }
}

// 임시 소식 데이터 생성
function generateMockNews(page, category) {
    const allNews = [
        {
            id: 'news_001',
            title: 'v2.5.0 신규 업데이트 출시',
            category: '업데이트',
            excerpt: '새로운 레이드 던전 \'고대의 신전\'이 추가되었습니다. 12인 공격대로 도전할 수 있으며, 전설 등급 장비를 획득할 수 있는 기회!',
            thumbnail: '📰',
            date: '2025-11-26T10:00:00Z'
        },
        {
            id: 'news_002',
            title: '윈터 페스티벌 이벤트 시작!',
            category: '이벤트',
            excerpt: '따뜻한 겨울을 보내기 위한 특별 이벤트가 시작됩니다. 매일 접속하면 특별 보상을 획득할 수 있으며, 한정판 눈꽃 스킨과 귀여운 펫을 만나보실 수 있습니다.',
            thumbnail: '🎮',
            date: '2025-11-23T10:00:00Z'
        },
        {
            id: 'news_003',
            title: '11월 21일 정기 점검 안내',
            category: '점검',
            excerpt: '더 나은 게임 환경을 위한 정기 점검이 진행됩니다. 점검 시간: 2025년 11월 21일 오전 6시 ~ 오전 10시 (4시간 예정).',
            thumbnail: '⚠️',
            date: '2025-11-20T10:00:00Z'
        },
        {
            id: 'news_004',
            title: '시즌2 랭킹 보상 지급 완료',
            category: '이벤트',
            excerpt: '시즌2가 성공적으로 종료되었습니다! 상위 랭커분들께 약속드린 보상이 모두 지급되었으니 확인해주세요.',
            thumbnail: '🏆',
            date: '2025-11-15T10:00:00Z'
        },
        {
            id: 'news_005',
            title: '크로스플랫폼 플레이 정식 오픈',
            category: '공지사항',
            excerpt: 'PC와 모바일 간 크로스플랫폼 플레이가 정식으로 지원됩니다! 이제 친구들과 플랫폼 구분 없이 함께 플레이하세요.',
            thumbnail: '📢',
            date: '2025-11-10T10:00:00Z'
        }
    ];
    
    // 카테고리 필터링
    let filteredNews = allNews;
    if (category !== '전체') {
        filteredNews = allNews.filter(news => news.category === category);
    }
    
    // 페이지네이션
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedNews = filteredNews.slice(start, end);
    
    return {
        news: paginatedNews,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(filteredNews.length / itemsPerPage),
            totalItems: filteredNews.length,
            hasNext: end < filteredNews.length,
            hasPrev: page > 1
        }
    };
}

// 소식 목록 렌더링
function renderNewsList(newsList) {
    const container = document.getElementById('newsList');
    
    if (!newsList || newsList.length === 0) {
        container.innerHTML = '<div class="no-results">해당 카테고리에 소식이 없습니다.</div>';
        return;
    }
    
    const newsHtml = newsList.map(news => `
        <article class="news-item" data-news-id="${news.id}">
            <div class="news-thumbnail">${news.thumbnail}</div>
            <div class="news-details">
                <div class="news-meta">
                    <span class="news-category">${news.category}</span>
                    <span class="news-date">📅 ${formatDate(news.date)}</span>
                </div>
                <h3>${news.title}</h3>
                <p class="news-excerpt">${news.excerpt}</p>
                <a href="#" class="read-more" data-news-id="${news.id}">
                    자세히 보기 →
                </a>
            </div>
        </article>
    `).join('');
    
    container.innerHTML = newsHtml;
    
    // 소식 클릭 이벤트 등록
    container.querySelectorAll('.read-more').forEach(btn => {
        btn.addEventListener('click', handleNewsClick);
    });
}

// 페이지네이션 렌더링
function renderPagination(pagination) {
    const container = document.getElementById('pagination');
    
    if (!pagination || pagination.totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let paginationHtml = '';
    
    // 이전 버튼
    paginationHtml += `
        <button class="page-btn" ${!pagination.hasPrev ? 'disabled' : ''} 
                data-page="${pagination.currentPage - 1}">←</button>
    `;
    
    // 페이지 번호들
    for (let i = 1; i <= pagination.totalPages; i++) {
        paginationHtml += `
            <button class="page-btn ${i === pagination.currentPage ? 'active' : ''}"
                    data-page="${i}">${i}</button>
        `;
    }
    
    // 다음 버튼
    paginationHtml += `
        <button class="page-btn" ${!pagination.hasNext ? 'disabled' : ''} 
                data-page="${pagination.currentPage + 1}">→</button>
    `;
    
    container.innerHTML = paginationHtml;
    
    // 페이지 클릭 이벤트 등록
    container.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', handlePageClick);
    });
}

// 필터 탭 초기화
function initFilterTabs() {
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // 활성 탭 변경
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // 카테고리 변경하고 첫 페이지로
            currentCategory = category;
            currentPage = 1;
            
            // 새로운 목록 로딩
            loadNewsList(currentPage, currentCategory);
        });
    });
}

// 페이지 클릭 핸들러
function handlePageClick(e) {
    e.preventDefault();
    const page = parseInt(e.target.getAttribute('data-page'));
    
    if (page && page !== currentPage && !e.target.disabled) {
        currentPage = page;
        loadNewsList(currentPage, currentCategory);
        
        // 페이지 상단으로 스크롤
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// 소식 클릭 핸들러
function handleNewsClick(e) {
    e.preventDefault();
    const newsId = e.target.getAttribute('data-news-id');
    
    // 실제로는 상세 페이지로 이동하거나 모달 표시
    alert(`소식 상세보기: ${newsId}\n(백엔드 구현 후 실제 페이지로 이동합니다.)`);
    
    // 실제 구현 예시:
    // window.location.href = `news-detail.html?id=${newsId}`;
}

// 날짜 포맷팅
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return '오늘';
    } else if (diffDays === 1) {
        return '어제';
    } else if (diffDays < 7) {
        return `${diffDays}일 전`;
    } else {
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// 로딩 상태 표시
function showLoading(show) {
    const container = document.getElementById('newsList');
    if (show) {
        container.innerHTML = '<div class="loading-spinner">로딩 중...</div>';
    }
}

// 에러 표시
function showError(message) {
    const container = document.getElementById('newsList');
    container.innerHTML = `<div class="error-message">${message}</div>`;
} 