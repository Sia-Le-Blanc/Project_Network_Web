// auth.js - 로그인/회원가입 페이지 공용 스크립트

// 배경 애니메이션 초기화
function initAuthBackground(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 500;
    const posArray = new Float32Array(particlesCount * 3);
    
    for(let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 100;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.15,
        color: canvasId === 'loginBg' ? 0xe94560 : 0xff6b6b,
        transparent: true,
        opacity: 0.6
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    camera.position.z = 30;
    
    function animate() {
        requestAnimationFrame(animate);
        particlesMesh.rotation.y += 0.001;
        particlesMesh.rotation.x += 0.0005;
        renderer.render(scene, camera);
    }
    animate();
    
    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });
}

// 로그인 폼 처리
function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;
        const loginBtn = document.getElementById('loginBtn');
        const loading = document.getElementById('loginLoading');
        
        // 로딩 상태
        loginBtn.classList.add('loading');
        loginBtn.disabled = true;
        loading.style.display = 'inline-block';
        
        try {
            const result = await api.login(email, password, remember);
            
            // 로그인 성공
            api.showSuccess('로그인 성공!');
            
            // 메인 페이지로 이동
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
            
        } catch (error) {
            api.showError(error.message);
            
            // 로딩 상태 해제
            loginBtn.classList.remove('loading');
            loginBtn.disabled = false;
            loading.style.display = 'none';
        }
    });

    // 소셜 로그인 버튼들
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const provider = this.getAttribute('data-provider');
            handleSocialLogin(provider);
        });
    });
}

// 회원가입 폼 처리
function initSignupForm() {
    const signupForm = document.getElementById('signupForm');
    if (!signupForm) return;

    const username = document.getElementById('username');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const terms = document.getElementById('terms');
    const signupBtn = document.getElementById('signupBtn');

    // 비밀번호 강도 체크
    if (password) {
        password.addEventListener('input', function() {
            updatePasswordStrength(this.value);
        });
    }

    // 실시간 유효성 검사
    function validateForm() {
        let isValid = true;

        if (username && username.value.length < 3) {
            showFieldError('usernameError', true);
            isValid = false;
        } else if (username) {
            showFieldError('usernameError', false);
        }

        if (email) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email.value)) {
                showFieldError('emailError', true);
                isValid = false;
            } else {
                showFieldError('emailError', false);
            }
        }

        if (password && confirmPassword) {
            if (password.value !== confirmPassword.value) {
                showFieldError('confirmError', true);
                isValid = false;
            } else {
                showFieldError('confirmError', false);
            }
        }

        if (terms && !terms.checked) {
            isValid = false;
        }

        if (signupBtn) {
            signupBtn.disabled = !isValid;
        }
    }

    // 이벤트 리스너 등록
    [username, email, password, confirmPassword, terms].forEach(element => {
        if (element) {
            element.addEventListener('input', validateForm);
            element.addEventListener('change', validateForm);
        }
    });

    // 회원가입 폼 제출
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            username: username.value,
            email: email.value,
            password: password.value,
            birthdate: document.getElementById('birthdate').value,
            region: document.getElementById('region').value,
            marketing: document.getElementById('marketing').checked
        };
        
        const loading = document.getElementById('signupLoading');
        
        // 로딩 상태
        signupBtn.classList.add('loading');
        signupBtn.disabled = true;
        loading.style.display = 'inline-block';
        
        try {
            await api.signup(formData);
            
            // 회원가입 성공
            api.showSuccess('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
            
            // 로그인 페이지로 이동
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            
        } catch (error) {
            api.showError(error.message);
            
            // 로딩 상태 해제
            signupBtn.classList.remove('loading');
            signupBtn.disabled = false;
            loading.style.display = 'none';
        }
    });
}

// 비밀번호 강도 업데이트
function updatePasswordStrength(value) {
    const strengthBar = document.getElementById('strengthBar');
    if (!strengthBar) return;
    
    let strength = 0;
    if (value.length >= 8) strength++;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) strength++;
    if (/\d/.test(value)) strength++;
    if (/[^a-zA-Z0-9]/.test(value)) strength++;
    
    strengthBar.className = 'password-strength-bar';
    if (strength <= 2) {
        strengthBar.classList.add('strength-weak');
    } else if (strength === 3) {
        strengthBar.classList.add('strength-medium');
    } else {
        strengthBar.classList.add('strength-strong');
    }
}

// 필드 에러 표시/숨김
function showFieldError(errorId, show) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        if (show) {
            errorElement.classList.add('show');
        } else {
            errorElement.classList.remove('show');
        }
    }
}

// 소셜 로그인 처리
function handleSocialLogin(provider) {
    // 실제로는 OAuth 플로우로 처리
    api.showError(`${provider} 로그인은 백엔드 구현 후 활성화됩니다.`);
    
    // 실제 구현 예시:
    // window.location.href = `/api/auth/social/${provider}`;
}

// 페이지 로드시 초기화
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'login.html') {
        initAuthBackground('loginBg');
        initLoginForm();
    } else if (currentPage === 'signup.html') {
        initAuthBackground('signupBg');
        initSignupForm();
    }
});