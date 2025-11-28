// community.js - 커뮤니티 페이지 전용 스크립트

let currentPage = 1;
let currentCategory = '전체';
let currentSort = 'latest';
const postsPerPage = 20;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initCommunityPage();
});

// 커뮤니티 페이지 초기화
async function initCommunityPage() {
    try {
        // 인증 상태 확인
        checkAuthStatus();
        
        // 게시글 목록 로딩
        await loadPosts(currentCategory, currentPage, currentSort);
        
        // 이벤트 리스너 등록
        initEventListeners();
        
    } catch (error) {
        console.error('커뮤니티 페이지 초기화 오류:', error);
        showError('커뮤니티를 불러오는 중 오류가 발생했습니다.');
    }
}

// 인증 상태 확인
function checkAuthStatus() {
    const isAuthenticated = api.isAuthenticated();
    const createPostBtn = document.getElementById('createPostBtn');
    
    if (!isAuthenticated) {
        createPostBtn.textContent = '🔒 로그인 필요';
        createPostBtn.disabled = true;
    }
}

// 이벤트 리스너 초기화
function initEventListeners() {
    // 카테고리 사이드바
    document.querySelectorAll('.sidebar-category').forEach(category => {
        category.addEventListener('click', handleCategoryClick);
    });

    // 글쓰기 버튼
    document.getElementById('createPostBtn').addEventListener('click', handleCreatePost);

    // 검색
    document.getElementById('searchBtn').addEventListener('click', handleSearch);
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // 모달 닫기 (글쓰기 모달이 있다면)
    const modal = document.getElementById('createPostModal');
    if (modal) {
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
    }
}

// 게시글 목록 로딩
async function loadPosts(category = '전체', page = 1, sort = 'latest') {
    try {
        showLoading(true);
        
        // 임시 게시글 데이터 (실제로는 API에서 로딩)
        const mockPosts = generateMockPosts(category, page, sort);
        
        renderPosts(mockPosts.posts);
        renderPagination(mockPosts.pagination);
        
        // 실제 API 호출 (백엔드 구현 후 활성화)
        /*
        const response = await api.getCommunityPosts(page, postsPerPage, category, sort);
        if (response.success) {
            renderPosts(response.data.posts);
            renderPagination(response.data.pagination);
        } else {
            throw new Error('게시글 데이터를 불러올 수 없습니다.');
        }
        */
        
    } catch (error) {
        console.error('게시글 로딩 오류:', error);
        showError('게시글을 불러오는 중 오류가 발생했습니다.');
    } finally {
        showLoading(false);
    }
}

// 임시 게시글 데이터 생성
function generateMockPosts(category, page, sort) {
    const allPosts = [
        {
            id: 'post_001',
            title: '신규 레이드 공략법 완벽 정리 🔥',
            category: '공략/팁',
            author: { username: '레이드마스터', avatar: '🦸' },
            excerpt: '고대의 신전 레이드 1~3페이즈까지 완벽 공략법을 정리했습니다. 각 보스별 패턴과 딜타임, 필수 아이템까지 모두 담았으니 참고하세요!',
            tags: ['공략', '레이드'],
            createdAt: '2시간 전',
            stats: { views: 1248, likes: 156, comments: 43 },
            isHot: true
        },
        {
            id: 'post_002',
            title: '워리어 빌드 추천 좀 해주세요',
            category: '질문/답변',
            author: { username: '초보전사', avatar: '⚔️' },
            excerpt: '워리어로 막 70렙 찍었는데 어떤 빌드로 가야할지 모르겠어요. PVE 위주로 하려고 하는데 추천 부탁드립니다!',
            tags: ['질문'],
            createdAt: '5시간 전',
            stats: { views: 342, likes: 12, comments: 18 }
        },
        {
            id: 'post_003',
            title: '제 길드 소개합니다! 신규 길드원 모집중',
            category: '길드모집',
            author: { username: '길드마스터김', avatar: '👑' },
            excerpt: '활동적인 길드 \'이터널\'에서 신규 길드원을 모집합니다. 주 3회 레이드 진행, 길드버프 상시 활성화! 친목 위주 길드입니다.',
            tags: ['길드모집'],
            createdAt: '8시간 전',
            stats: { views: 567, likes: 34, comments: 27 }
        },
        {
            id: 'post_004',
            title: 'RA 팬아트 그려봤어요 ✨',
            category: '팬아트',
            author: { username: '아티스트현아', avatar: '🎨' },
            excerpt: '제가 좋아하는 메이지 캐릭터를 팬아트로 그려봤습니다. 많이 봐주세요! 다음엔 워리어도 그려볼 예정입니다 ㅎㅎ',
            tags: ['팬아트'],
            createdAt: '12시간 전',
            stats: { views: 2134, likes: 289, comments: 67 },
            isHot: true
        },
        {
            id: 'post_005',
            title: 'PVP 메타 변화 분석 (패치 2.5.0 기준)',
            category: '공략/팁',
            author: { username: '데이터분석러', avatar: '📊' },
            excerpt: '최신 패치 이후 PVP 메타가 크게 변했습니다. 각 클래스별 승률 통계와 함께 현재 최강 조합을 분석해봤어요.',
            tags: ['공략', 'PVP'],
            createdAt: '1일 전',
            stats: { views: 892, likes: 78, comments: 35 }
        }
    ];
    
    // 카테고리 필터링
    let filteredPosts = allPosts;
    if (category !== '전체') {
        filteredPosts = allPosts.filter(post => post.category === category);
    }
    
    // 정렬
    if (sort === 'popular') {
        filteredPosts.sort((a, b) => b.stats.likes - a.stats.likes);
    } else if (sort === 'views') {
        filteredPosts.sort((a, b) => b.stats.views - a.stats.views);
    }
    
    // 페이지네이션
    const start = (page - 1) * postsPerPage;
    const end = start + postsPerPage;
    const paginatedPosts = filteredPosts.slice(start, end);
    
    return {
        posts: paginatedPosts,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(filteredPosts.length / postsPerPage),
            totalItems: filteredPosts.length
        }
    };
}

// 게시글 목록 렌더링
function renderPosts(posts) {
    const container = document.getElementById('postsContainer');
    
    if (!posts || posts.length === 0) {
        container.innerHTML = '<div class="no-results">해당 카테고리에 게시글이 없습니다.</div>';
        return;
    }
    
    const postsHtml = posts.map(post => `
        <article class="post-card" data-post-id="${post.id}">
            <div class="post-header">
                <div class="post-info">
                    <h3 class="post-title">
                        ${post.title}
                        ${post.isHot ? '<span class="hot-badge">HOT</span>' : ''}
                    </h3>
                    <div class="post-meta">
                        <div class="post-author">
                            <div class="author-avatar">${post.author.avatar}</div>
                            <span>${post.author.username}</span>
                        </div>
                        <span>📅 ${post.createdAt}</span>
                    </div>
                </div>
                <div class="post-tags">
                    ${post.tags.map(tag => `<span class="post-tag">${tag}</span>`).join('')}
                </div>
            </div>
            <p class="post-excerpt">${post.excerpt}</p>
            <div class="post-stats">
                <div class="stat-item">
                    <span class="stat-icon">👁️</span>
                    <span>${post.stats.views.toLocaleString()}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-icon">👍</span>
                    <span>${post.stats.likes}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-icon">💬</span>
                    <span>${post.stats.comments}</span>
                </div>
            </div>
        </article>
    `).join('');
    
    container.innerHTML = postsHtml;
    
    // 게시글 클릭 이벤트 등록
    container.querySelectorAll('.post-card').forEach(card => {
        card.addEventListener('click', handlePostClick);
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
        <button class="page-btn" ${pagination.currentPage === 1 ? 'disabled' : ''} 
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
        <button class="page-btn" ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''} 
                data-page="${pagination.currentPage + 1}">→</button>
    `;
    
    container.innerHTML = paginationHtml;
    
    // 페이지 클릭 이벤트 등록
    container.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', handlePageClick);
    });
}

// 카테고리 클릭 핸들러
function handleCategoryClick(e) {
    const category = this.getAttribute('data-category');
    
    // 활성 카테고리 변경
    document.querySelectorAll('.sidebar-category').forEach(c => c.classList.remove('active'));
    this.classList.add('active');
    
    // 카테고리 변경하고 첫 페이지로
    currentCategory = category;
    currentPage = 1;
    
    // 새로운 목록 로딩
    loadPosts(currentCategory, currentPage, currentSort);
}

// 페이지 클릭 핸들러
function handlePageClick(e) {
    e.preventDefault();
    const page = parseInt(e.target.getAttribute('data-page'));
    
    if (page && page !== currentPage && !e.target.disabled) {
        currentPage = page;
        loadPosts(currentCategory, currentPage, currentSort);
        
        // 페이지 상단으로 스크롤
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// 게시글 클릭 핸들러
function handlePostClick(e) {
    e.preventDefault();
    const postId = this.getAttribute('data-post-id');
    
    // 실제로는 상세 페이지로 이동하거나 모달 표시
    alert(`게시글 상세보기: ${postId}\n(백엔드 구현 후 실제 페이지로 이동합니다.)`);
    
    // 실제 구현 예시:
    // window.location.href = `post-detail.html?id=${postId}`;
}

// 글쓰기 버튼 핸들러
function handleCreatePost() {
    if (!api.isAuthenticated()) {
        alert('로그인이 필요한 기능입니다.');
        window.location.href = 'login.html';
        return;
    }
    
    // 실제로는 글쓰기 페이지로 이동하거나 모달 표시
    alert('글쓰기 페이지로 이동합니다.\n(백엔드 구현 후 실제 기능 활성화)');
    
    // 실제 구현 예시:
    // window.location.href = 'post-create.html';
}

// 검색 핸들러
async function handleSearch() {
    const keyword = document.getElementById('searchInput').value.trim();
    
    if (!keyword) {
        alert('검색어를 입력해주세요.');
        return;
    }
    
    try {
        showLoading(true);
        
        // 실제로는 API 검색 호출
        alert(`"${keyword}" 검색 결과를 표시합니다.\n(백엔드 구현 후 실제 검색 기능 활성화)`);
        
        // 실제 구현 예시:
        /*
        const response = await api.searchPosts(keyword, currentPage);
        if (response.success) {
            renderPosts(response.data.posts);
            renderPagination(response.data.pagination);
        }
        */
        
    } catch (error) {
        console.error('검색 오류:', error);
        api.showError('검색 중 오류가 발생했습니다.');
    } finally {
        showLoading(false);
    }
}

// 로딩 상태 표시
function showLoading(show) {
    const container = document.getElementById('postsContainer');
    if (show) {
        container.innerHTML = '<div class="loading-spinner">로딩 중...</div>';
    }
}

// 에러 표시
function showError(message) {
    const container = document.getElementById('postsContainer');
    container.innerHTML = `<div class="error-message">${message}</div>`;
}