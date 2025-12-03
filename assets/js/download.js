class DownloadManager {
    constructor() {
        this.apiClient = new APIClient();
        this.downloadProgress = 0;
        this.isDownloading = false;
    }

    init() {
        this.setupEventListeners();
        this.detectUserPlatform();
        this.loadDownloadStats();
    }

    setupEventListeners() {
        // 메인 다운로드 버튼
        const mainDownloadBtn = document.getElementById('mainDownloadBtn');
        if (mainDownloadBtn) {
            mainDownloadBtn.addEventListener('click', () => this.handleMainDownload());
        }

        // 플랫폼별 다운로드 버튼들
        document.querySelectorAll('.platform-download-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const platform = btn.dataset.platform;
                this.handlePlatformDownload(platform);
            });
        });

        // FAQ 토글
        document.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', () => {
                this.toggleFAQ(question.closest('.faq-item'));
            });
        });

        // 모달 닫기
        const closeModal = document.getElementById('closeModal');
        if (closeModal) {
            closeModal.addEventListener('click', () => this.closeDownloadModal());
        }

        // 모달 외부 클릭으로 닫기
        const modal = document.getElementById('downloadModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeDownloadModal();
                }
            });
        }
    }

    detectUserPlatform() {
        const userAgent = navigator.userAgent.toLowerCase();
        let detectedPlatform = 'windows'; // 기본값

        if (userAgent.includes('mac')) {
            detectedPlatform = 'mac';
        } else if (userAgent.includes('android')) {
            detectedPlatform = 'android';
        } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
            detectedPlatform = 'ios';
        }

        // 감지된 플랫폼 강조
        const platformCard = document.querySelector(`[data-platform="${detectedPlatform}"]`)?.closest('.platform-card');
        if (platformCard) {
            platformCard.style.borderColor = '#e94560';
            platformCard.style.transform = 'translateY(-5px)';
            
            // 추천 배지 추가
            const badge = document.createElement('div');
            badge.innerHTML = '<span style="background: #e94560; color: #fff; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; position: absolute; top: -10px; right: 20px;">추천</span>';
            platformCard.style.position = 'relative';
            platformCard.appendChild(badge);
        }

        // 메인 버튼 텍스트 업데이트
        const mainBtn = document.getElementById('mainDownloadBtn');
        if (mainBtn) {
            const platformNames = {
                'windows': 'Windows용',
                'mac': 'Mac용',
                'android': 'Android용',
                'ios': 'iOS용'
            };
            mainBtn.innerHTML = `🚀 ${platformNames[detectedPlatform]} 다운로드`;
            mainBtn.dataset.platform = detectedPlatform;
        }
    }

    async loadDownloadStats() {
        try {
            const response = await this.apiClient.get('/download/stats');
            if (response.success) {
                this.updateDownloadStats(response.data);
            }
        } catch (error) {
            console.error('다운로드 통계 로딩 실패:', error);
        }
    }

    updateDownloadStats(stats) {
        // 플랫폼별 다운로드 수 업데이트
        Object.keys(stats.platforms || {}).forEach(platform => {
            const platformCard = document.querySelector(`[data-platform="${platform}"]`)?.closest('.platform-card');
            if (platformCard) {
                const infoEl = platformCard.querySelector('.platform-info');
                if (infoEl) {
                    infoEl.innerHTML += `<br>다운로드: ${this.formatNumber(stats.platforms[platform])}회`;
                }
            }
        });

        // 총 다운로드 수 표시
        if (stats.total) {
            const heroContent = document.querySelector('.download-hero-content p');
            if (heroContent) {
                heroContent.innerHTML += `<br><strong>${this.formatNumber(stats.total)}명의 플레이어가 함께하고 있습니다!</strong>`;
            }
        }
    }

    handleMainDownload() {
        const platform = document.getElementById('mainDownloadBtn').dataset.platform || 'windows';
        this.handlePlatformDownload(platform);
    }

    async handlePlatformDownload(platform) {
        if (this.isDownloading) {
            alert('이미 다운로드가 진행 중입니다.');
            return;
        }

        try {
            // 다운로드 시작 API 호출
            const response = await this.apiClient.post('/download/start', {
                platform: platform,
                userAgent: navigator.userAgent
            });

            if (response.success) {
                this.startDownload(platform, response.data.downloadUrl, response.data.filename);
                
                // 다운로드 통계 업데이트
                this.trackDownload(platform);
            } else {
                alert('다운로드 링크를 가져오는데 실패했습니다.');
            }
        } catch (error) {
            console.error('다운로드 시작 실패:', error);
            
            // API 실패 시 직접 다운로드
            this.startDirectDownload(platform);
        }
    }

    startDownload(platform, downloadUrl, filename) {
        this.isDownloading = true;
        this.showDownloadModal(platform, filename);

        // 실제 파일 다운로드 시작
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // 진행률 시뮬레이션 (실제로는 파일 다운로드 상태를 모니터링해야 함)
        this.simulateDownloadProgress();
    }

    startDirectDownload(platform) {
        // API 없이 직접 다운로드 (개발 시 사용)
        const downloadLinks = {
            'windows': 'https://example.com/ra-game-windows.exe',
            'mac': 'https://example.com/ra-game-mac.dmg',
            'android': 'https://play.google.com/store/apps/details?id=com.example.ra',
            'ios': 'https://apps.apple.com/app/ra-game/id123456789'
        };

        const filename = {
            'windows': 'RA-Game-Setup.exe',
            'mac': 'RA-Game.dmg',
            'android': 'RA Game (Google Play)',
            'ios': 'RA Game (App Store)'
        };

        if (platform === 'android' || platform === 'ios') {
            // 모바일은 스토어로 리다이렉트
            window.open(downloadLinks[platform], '_blank');
            this.showDownloadModal(platform, filename[platform]);
            setTimeout(() => this.closeDownloadModal(), 3000);
        } else {
            // PC는 파일 다운로드
            this.startDownload(platform, downloadLinks[platform], filename[platform]);
        }
    }

    showDownloadModal(platform, filename) {
        const modal = document.getElementById('downloadModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');

        if (modal && modalTitle && modalMessage) {
            const platformNames = {
                'windows': 'Windows',
                'mac': 'Mac',
                'android': 'Android',
                'ios': 'iOS'
            };

            modalTitle.textContent = `${platformNames[platform]} 다운로드`;
            modalMessage.textContent = `${filename} 다운로드를 시작합니다...`;
            
            modal.classList.add('active');
        }
    }

    closeDownloadModal() {
        const modal = document.getElementById('downloadModal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.isDownloading = false;
        this.downloadProgress = 0;
        this.updateProgressBar(0);
    }

    simulateDownloadProgress() {
        const progressBar = document.getElementById('progressBar');
        const modalMessage = document.getElementById('modalMessage');
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                if (modalMessage) {
                    modalMessage.textContent = '다운로드가 완료되었습니다!';
                }
                
                setTimeout(() => {
                    this.closeDownloadModal();
                }, 2000);
            }
            
            this.updateProgressBar(progress);
        }, 200);
    }

    updateProgressBar(progress) {
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }

    async trackDownload(platform) {
        try {
            await this.apiClient.post('/download/track', {
                platform: platform,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('다운로드 추적 실패:', error);
        }
    }

    toggleFAQ(faqItem) {
        const isActive = faqItem.classList.contains('active');
        
        // 모든 FAQ 닫기
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // 선택한 FAQ만 열기
        if (!isActive) {
            faqItem.classList.add('active');
        }
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    const downloadManager = new DownloadManager();
    downloadManager.init();
});

// 페이지 이탈 시 다운로드 확인
window.addEventListener('beforeunload', (e) => {
    if (document.querySelector('.download-modal.active')) {
        e.preventDefault();
        e.returnValue = '다운로드가 진행 중입니다. 페이지를 떠나시겠습니까?';
        return e.returnValue;
    }
});