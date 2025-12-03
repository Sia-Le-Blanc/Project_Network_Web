class CommunityManager {
    constructor() {
        this.currentPage = 1;
        this.currentBoard = 'all';
        this.currentSearch = '';
        this.isLoading = false;
        this.apiClient = new APIClient();
    }

    async init() {
        this.setupEventListeners();
        await this.loadPosts();
        await this.loadPopularPosts();
    }

    setupEventListeners() {
        // 게시판 탭
        document.querySelectorAll('.board-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.handleBoardChange(e.target.dataset.board);
            });
        });

        // 검색
        const searchBtn = document.getElementById('searchBtn');
        const searchBox = document.getElementById('searchBox');
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.handleSearch());
        }
        
        if (searchBox) {
            searchBox.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch();
                }
            });
        }

        // 글쓰기 버튼
        const writeBtn = document.getElementById('writePostBtn');
        if (writeBtn) {
            writeBtn.addEventListener('click', () => this.handleWritePost());
        }

        // 페이지네이션 (동적 생성되므로 이벤트 위임 사용)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('page-btn')) {
                const page = parseInt(e.target.dataset.page);
                if (!isNaN(page)) {
                    this.handlePageChange(page);
                }
            }
        });

        // 게시글 클릭
        document.addEventListener('click', (e) => {
            const postItem = e.target.closest('.post-item, .popular-card');
            if (postItem) {
                const postId = postItem.dataset.id;
                if (postId) {
                    this.openPost(postId);
                }
            }
        });
    }

    async handleBoardChange(board) {
        // 활성 탭 업데이트
        document.querySelectorAll('.board-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-board="${board}"]`).classList.add('active');

        this.currentBoard = board;
        this.currentPage = 1;
        await this.loadPosts();
    }

    async handleSearch() {
        const searchBox = document.getElementById('searchBox');
        this.currentSearch = searchBox.value.trim();
        this.currentPage = 1;
        await this.loadPosts();
    }

    async handlePageChange(page) {
        this.currentPage = page;
        await this.loadPosts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    handleWritePost() {
        // 로그인 체크
        const isLoggedIn = checkLoginStatus();
        if (!isLoggedIn) {
            alert('로그인이 필요한 서비스입니다.');
            window.location.href = 'login.html';
            return;
        }

        // 실제로는 글쓰기 페이지로 이동하거나 모달을 열 수 있음
        console.log('글쓰기 페이지로 이동');
        // window.location.href = 'write-post.html';
    }

    async loadPosts() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.showLoading();

        try {
            const params = {
                page: this.currentPage,
                limit: 15,
                board: this.currentBoard === 'all' ? '' : this.currentBoard,
                search: this.currentSearch
            };

            const response = await this.apiClient.get('/community/posts', params);
            
            if (response.success) {
                this.renderPosts(response.data.posts);
                this.renderPagination(response.data.pagination);
            } else {
                this.showError('게시글을 불러오는데 실패했습니다.');
            }
        } catch (error) {
            console.error('게시글 로딩 에러:', error);
            this.showError('네트워크 오류가 발생했습니다.');
        } finally {
            this.isLoading = false;
        }
    }

    async loadPopularPosts() {
        try {
            const response = await this.apiClient.get('/community/popular');
            
            if (response.success) {
                this.renderPopularPosts(response.data.posts);
            }
        } catch (error) {
            console.error('인기 게시글 로딩 에러:', error);
        }
    }

    renderPosts(posts) {
        const postList = document.getElementById('postList');
        
        if (!posts || posts.length === 0) {
            this.showEmptyState();
            return;
        }

        const postsHTML = posts.map((post, index) => {
            const postNumber = (this.currentPage - 1) * 15 + index + 1;
            const isNew = this.isNewPost(post.created_at);
            const hasImage = post.has_image;
            
            return `
                <div class="post-item" data-id="${post.id}">
                    <div class="post-number">${postNumber}</div>
                    <div class="post-title-area">
                        <div class="post-title">
                            ${this.escapeHtml(post.title)}
                            ${isNew ? '<span style="color: #e94560; font-size: 12px;"> NEW</span>' : ''}
                            ${hasImage ? '<span style="color: #ffa500; font-size: 12px;"> 📷</span>' : ''}
                        </div>
                        <div class="post-preview">${this.escapeHtml(post.content_preview || '')}</div>
                        <div class="post-meta">
                            ${post.board ? `<span class="post-tag">${this.getBoardName(post.board)}</span>` : ''}
                            ${post.is_hot ? '<span class="post-tag" style="background: #ff6b6b;">HOT</span>' : ''}
                        </div>
                    </div>
                    <div class="post-author">${this.escapeHtml(post.author_name)}</div>
                    <div class="post-date">${formatTimeAgo(new Date(post.created_at))}</div>
                    <div class="post-views">${post.views || 0}</div>
                    <div class="post-comments">${post.comments_count || 0}</div>
                </div>
            `;
        }).join('');

        postList.innerHTML = `
            <div class="post-header">
                <div>번호</div>
                <div>제목</div>
                <div>작성자</div>
                <div>작성일</div>
                <div>조회수</div>
                <div>댓글</div>
            </div>
            ${postsHTML}
        `;
    }

    renderPopularPosts(posts) {
        const popularList = document.getElementById('popularList');
        
        if (!posts || posts.length === 0) {
            return;
        }

        popularList.innerHTML = posts.slice(0, 6).map(post => `
            <div class="popular-card" data-id="${post.id}">
                <h4>${this.escapeHtml(post.title)}</h4>
                <p>${this.escapeHtml(post.content_preview || '')}</p>
                <div class="popular-stats">
                    <span>👤 ${this.escapeHtml(post.author_name)}</span>
                    <span>👁 ${post.views || 0} · 💬 ${post.comments_count || 0}</span>
                </div>
            </div>
        `).join('');
    }

    renderPagination(pagination) {
        const paginationEl = document.getElementById('pagination');
        
        if (!pagination || pagination.totalPages <= 1) {
            paginationEl.innerHTML = '';
            return;
        }

        const { currentPage, totalPages } = pagination;
        let paginationHTML = '';

        // 이전 페이지
        paginationHTML += `
            <button class="page-btn" data-page="${currentPage - 1}" 
                    ${currentPage === 1 ? 'disabled' : ''}>‹</button>
        `;

        // 페이지 번호들
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        if (startPage > 1) {
            paginationHTML += `<button class="page-btn" data-page="1">1</button>`;
            if (startPage > 2) {
                paginationHTML += `<span class="page-btn" disabled>...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="page-btn ${i === currentPage ? 'active' : ''}" 
                        data-page="${i}">${i}</button>
            `;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += `<span class="page-btn" disabled>...</span>`;
            }
            paginationHTML += `<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`;
        }

        // 다음 페이지
        paginationHTML += `
            <button class="page-btn" data-page="${currentPage + 1}" 
                    ${currentPage === totalPages ? 'disabled' : ''}>›</button>
        `;

        paginationEl.innerHTML = paginationHTML;
    }

    showLoading() {
        const postList = document.getElementById('postList');
        postList.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>게시글을 불러오는 중...</p>
            </div>
        `;
    }

    showEmptyState() {
        const postList = document.getElementById('postList');
        const message = this.currentSearch 
            ? `"${this.currentSearch}"에 대한 검색 결과가 없습니다.`
            : '등록된 게시글이 없습니다.';
            
        postList.innerHTML = `
            <div class="empty-state">
                <div class="icon">💬</div>
                <h3>게시글이 없습니다</h3>
                <p>${message}</p>
            </div>
        `;
    }

    showError(message) {
        const postList = document.getElementById('postList');
        postList.innerHTML = `
            <div class="empty-state">
                <div class="icon">❌</div>
                <h3>오류가 발생했습니다</h3>
                <p>${message}</p>
            </div>
        `;
    }

    openPost(postId) {
        console.log('게시글 상세보기:', postId);
        // 실제로는 상세 페이지로 이동
        // window.location.href = `post-detail.html?id=${postId}`;
    }

    isNewPost(createdAt) {
        const postDate = new Date(createdAt);
        const now = new Date();
        const diffHours = (now - postDate) / (1000 * 60 * 60);
        return diffHours <= 24; // 24시간 이내를 새 글로 판단
    }

    getBoardName(board) {
        const boardNames = {
            'free': '자유',
            'qna': 'Q&A',
            'strategy': '공략',
            'guild': '길드',
            'trade': '거래',
            'screenshot': '스크린샷'
        };
        return boardNames[board] || '일반';
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    const communityManager = new CommunityManager();
    communityManager.init();
});