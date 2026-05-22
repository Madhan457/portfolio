// ===== THEME TOGGLE =====
// Global mouse coordinates for background effects
let cx = -1000, cy = -1000;
const themeToggle = document.getElementById('themeToggle');
const htmlEl = document.documentElement;

// Check local storage for theme
const savedTheme = localStorage.getItem('portfolio-theme');
if (savedTheme) {
    htmlEl.setAttribute('data-theme', savedTheme);
}

themeToggle.addEventListener('click', () => {
    const currentTheme = htmlEl.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlEl.setAttribute('data-theme', newTheme);
    localStorage.setItem('portfolio-theme', newTheme);

    // Trigger particle colors to update
    if (window.updateBgParticlesTheme) {
        setTimeout(window.updateBgParticlesTheme, 50);
    }
});

// ===== CANVAS CONSTELLATION BACKGROUND =====
const canvas = document.getElementById('bgCanvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let particleCount = 60;
    let maxDistance = 120;
    let mouseRadius = 150;

    // Theme colors
    let colorAccent = '#00c2ff';
    let colorPurple = '#b026ff';
    let lineOpacityFactor = 0.15;

    function updateColors() {
        const style = getComputedStyle(document.documentElement);
        colorAccent = style.getPropertyValue('--accent').trim() || '#00c2ff';
        colorPurple = style.getPropertyValue('--accent-purple').trim() || '#b026ff';
        const theme = document.documentElement.getAttribute('data-theme');
        lineOpacityFactor = theme === 'light' ? 0.07 : 0.15;
    }
    window.updateBgParticlesTheme = updateColors;
    updateColors();

    class Particle {
        constructor() {
            this.reset();
            this.x = Math.random() * (canvas.width / (window.devicePixelRatio || 1));
            this.y = Math.random() * (canvas.height / (window.devicePixelRatio || 1));
        }

        reset() {
            const dpr = window.devicePixelRatio || 1;
            const w = canvas.width / dpr;
            const h = canvas.height / dpr;
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.size = Math.random() * 2 + 1; // 1px to 3px
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.speedY = (Math.random() - 0.5) * 0.4;
            this.color = Math.random() > 0.5 ? 'accent' : 'purple';
            this.alpha = Math.random() * 0.4 + 0.15;
        }

        update() {
            const dpr = window.devicePixelRatio || 1;
            const w = canvas.width / dpr;
            const h = canvas.height / dpr;

            this.x += this.speedX;
            this.y += this.speedY;

            // Screen boundaries wrap/bounce
            if (this.x < 0 || this.x > w) this.speedX *= -1;
            if (this.y < 0 || this.y > h) this.speedY *= -1;

            // Mouse push/repel interaction
            const dx = this.x - cx;
            const dy = this.y - cy;
            const distSq = dx * dx + dy * dy;
            const mouseRadiusSq = mouseRadius * mouseRadius;
            if (distSq < mouseRadiusSq) {
                const dist = Math.sqrt(distSq);
                const force = (mouseRadius - dist) / mouseRadius;
                const angle = Math.atan2(dy, dx);
                // Gently push particles away
                this.x += Math.cos(angle) * force * 1.2;
                this.y += Math.sin(angle) * force * 1.2;
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color === 'accent' ? colorAccent : colorPurple;
            ctx.globalAlpha = this.alpha;
            ctx.fill();
        }
    }

    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx.scale(dpr, dpr);

        if (window.innerWidth < 768) {
            particleCount = 30;
            maxDistance = 80;
        } else {
            particleCount = 70;
            maxDistance = 125;
        }

        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function animate() {
        const dpr = window.devicePixelRatio || 1;
        const w = canvas.width / dpr;
        const h = canvas.height / dpr;
        ctx.clearRect(0, 0, w, h);

        // Update & Draw particles
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.update();
            p.draw();

            // Connect close nodes
            const maxDistSq = maxDistance * maxDistance;
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < maxDistSq) {
                    const dist = Math.sqrt(distSq);
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);

                    const opacity = (1 - dist / maxDistance) * lineOpacityFactor;
                    ctx.strokeStyle = p.color === 'accent' ? colorAccent : colorPurple;
                    ctx.globalAlpha = opacity;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animate);
    }
    animate();
}

// ===== MAGNETIC BUTTONS =====
document.querySelectorAll('.magnetic').forEach(el => {
    let r = null;
    el.addEventListener('mouseenter', () => {
        r = el.getBoundingClientRect();
    });
    el.addEventListener('mousemove', e => {
        if (!r) r = el.getBoundingClientRect();
        const s = +(el.dataset.strength || 15);
        const dx = (e.clientX - r.left - r.width / 2) / r.width * s;
        const dy = (e.clientY - r.top - r.height / 2) / r.height * s;
        el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    });
    el.addEventListener('mouseleave', () => {
        el.style.transform = '';
        r = null;
    });
});

// ===== 3D TILT EFFECT =====
document.querySelectorAll('.glass-card, .sk').forEach(card => {
    let r = null;
    card.addEventListener('mouseenter', () => {
        if (window.innerWidth <= 968) return;
        r = card.getBoundingClientRect();
    });
    card.addEventListener('mousemove', e => {
        if (window.innerWidth <= 968) return;
        if (!r) r = card.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - 0.5) * 15;
        const y = ((e.clientY - r.top) / r.height - 0.5) * -15;
        card.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${y}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        r = null;
    });
});

// ===== NAVBAR SCROLL =====
const nav = document.getElementById('nav');
addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
});

// Mobile menu
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
burger.addEventListener('click', () => {
    const isVisible = navLinks.style.display === 'flex';
    navLinks.style.display = isVisible ? 'none' : 'flex';
    navLinks.style.flexDirection = 'column';
    navLinks.style.position = 'absolute';
    navLinks.style.top = '80px';
    navLinks.style.left = '0';
    navLinks.style.right = '0';
    navLinks.style.background = 'var(--bg-glass)';
    navLinks.style.backdropFilter = 'blur(20px)';
    navLinks.style.padding = '2rem';
});
// Hide mobile menu when a navigation link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        // Hide the mobile menu only on small screens
        if (window.innerWidth < 768) {
            navLinks.style.display = 'none';
        }
        // If About link, reset counters and re-trigger animation
        if (link.getAttribute('href') === '#about') {
            const counters = document.querySelectorAll('.counter-number');
            counters.forEach(c => c.innerText = '0');
            animateCounters();
        }
    });
});

// ===== TYPING ANIMATION =====
const phrases = ['Website Developer', 'Software Engineer', 'Mobile app developer'];
const typingEl = document.getElementById('typingText');
let pi = 0, ci = 0, deleting = false;

function type() {
    if (!typingEl) return;
    const current = phrases[pi];
    if (!deleting) {
        typingEl.textContent = current.substring(0, ci + 1);
        ci++;
        if (ci === current.length) {
            deleting = true;
            setTimeout(type, 2000);
            return;
        }
        setTimeout(type, 80);
    } else {
        typingEl.textContent = current.substring(0, ci - 1);
        ci--;
        if (ci === 0) {
            deleting = false;
            pi = (pi + 1) % phrases.length;
            setTimeout(type, 400);
            return;
        }
        setTimeout(type, 40);
    }
}

// ===== COUNTER ANIMATION =====
function animateCounters() {
    const counters = document.querySelectorAll('.counter-number');
    const animating = new Set();
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const counter = entry.target;
            const target = +counter.dataset.target;
            if (entry.isIntersecting) {
                if (animating.has(counter)) return; // already animating
                animating.add(counter);
                counter.innerText = '0'; // reset
                const duration = 1300; // faster animation (1300ms)
                const startTime = performance.now();
                const step = (timestamp) => {
                    const progress = Math.min((timestamp - startTime) / duration, 1);
                    counter.innerText = Math.ceil(progress * target);
                    if (progress < 1) {
                        requestAnimationFrame(step);
                    } else {
                        counter.innerText = `${target}+`;
                        animating.delete(counter);
                    }
                };
                requestAnimationFrame(step);
            } else {
                // reset when out of view so it can animate again later
                counter.innerText = '0';
                animating.delete(counter);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(counter => observer.observe(counter));
}

// ===== FETCH GITHUB PROJECTS =====
async function fetchProjects() {
    const projGrid = document.querySelector('.proj-grid');
    if (!projGrid) return;

    try {
        const response = await fetch(`https://api.github.com/users/Madhan457/repos?sort=updated&t=${Date.now()}`);
        if (!response.ok) throw new Error('Failed to fetch projects');
        const repos = await response.json();
        console.log('Fetched repos count:', repos.length);

        // Filter out forks and portfolio itself
        const filteredRepos = repos.filter(repo => !repo.fork && repo.name !== 'Madhan457');
        console.log('Filtered repos count:', filteredRepos.length);

        // Define custom order for projects
        const projectOrder = [
            'portfolio',
            'flames',
            'quickbill',
            'calculator',
            'weather',
            'passwordgenerator',
            'qrcodegenerator',
            'login',
            'signup',
            'otp',
            'glowbutton',
            'currencyconvertor',
            'bmi',
            'edutech'
        ];
        const orderMap = new Map(projectOrder.map((name, idx) => [name, idx]));
        // Helper to get order index; unknown projects get large index to preserve original order after known ones
        const getOrder = (name) => {
            const normalized = name.toLowerCase().replace(/\s+/g, '').replace(/-/g, '');
            // Alias: treat 'barcode' as 'quickbill' for ordering
            if (normalized.includes('barcode')) {
                const qbIdx = orderMap.get('quickbill');
                if (qbIdx !== undefined) return qbIdx;
            }
            for (const [key, idx] of orderMap.entries()) {
                if (normalized.includes(key)) return idx;
            }
            return projectOrder.length + filteredRepos.findIndex(r => r.name === name);
        };
        filteredRepos.sort((a, b) => getOrder(a.name) - getOrder(b.name));

        projGrid.innerHTML = '';

        filteredRepos.forEach(repo => {
            const article = document.createElement('article');
            article.className = 'proj-card glass-card';

            // Define image assets (png and jpeg) that exist in project root
            const imageFiles = ['bmi.png', 'button.png', 'calculator.png', 'currency.png', 'flames.png', 'weather.png', 'otp.png', 'password gen.png', 'qrcode gen.png', 'barcode.jpeg'];
            function getImageForRepo(name) {
                try {
                    const normalized = name.toLowerCase().replace(/\s+/g, '').replace(/-/g, '');
                    for (const file of imageFiles) {
                        const base = file.toLowerCase().replace(/\s+/g, '').replace(/-/g, '').replace(/\.(png|jpeg)$/, '');
                        if (normalized.includes(base) || base.includes(normalized)) {
                            return `./${file}`;
                        }
                    }
                } catch (e) {
                    console.error('Image mapping error:', e);
                }
                return null;
            }
            const matchedImage = getImageForRepo(repo.name);
            const imageUrl = matchedImage ? matchedImage : repo.owner.avatar_url;
            const language = repo.language || 'Code';
            let iconClass = 'fas fa-code';
            if (language === 'JavaScript') iconClass = 'fab fa-js-square';
            else if (language === 'HTML') iconClass = 'fab fa-html5';
            else if (language === 'CSS') iconClass = 'fab fa-css3-alt';
            else if (language === 'Python') iconClass = 'fab fa-python';
            else if (language === 'Java') iconClass = 'fab fa-java';
            else if (language === 'Dart') iconClass = 'fas fa-mobile-alt';
            else if (language === 'C++') iconClass = 'fas fa-cogs';
            // Fallback placeholder image if PNG not found
            const finalImageUrl = imageUrl || './placeholder.png';


            const topics = repo.topics && repo.topics.length > 0
                ? repo.topics.join(' &bull; ')
                : language;

            // Determine demo URL based on repo name and exclusions
            let demoUrl = null;
            const excluded = /login|signin|otp|bmi|barcode/i;
            if (!excluded.test(repo.name)) {
                const demoMap = {
                    'calculator': 'https://simple-calculator-liard-three.vercel.app',
                    'glowbutton': 'https://css-glow-button.vercel.app',
                    'flames': 'https://flames-ebon.vercel.app',
                    'currencyconvertor': 'https://currency-convertor-kohl-omega.vercel.app',
                    'qrcodegenerator': 'https://qr-code-generator-e4r7.vercel.app',
                    'passwordgenerator': 'https://password-generator-eta-opal.vercel.app',
                    'weather': 'https://weather-cyan-pi.vercel.app'
                };
                const norm = repo.name.toLowerCase().replace(/[-\s]/g, '');
                for (const key in demoMap) {
                    if (norm.includes(key)) { demoUrl = demoMap[key]; break; }
                }
            }

                            article.innerHTML = `
                    <div class="proj-img">
                        <img src="${finalImageUrl}" alt="${repo.name}" class="proj-img-inner"/>
                        <div class="proj-ov"><span>View Project →</span></div>
                    </div>
                    <div class="proj-body">
                        <span class="proj-tag">${topics}</span>
                        <h3>${repo.name.toLowerCase().includes('barcode') ? 'Quick Bill' : repo.name.replace(/-/g, ' ')}</h3>
                        ${(() => {
                            const name = repo.name.toLowerCase();
                            if (name.includes('barcode')) return '<p class="proj-desc">Smart billing and barcode management system for fast and efficient business transactions.</p>';
                            if (name.includes('otp') || name.includes('login') || name.includes('signup')) return '<p class="proj-desc">Authentication system with login, signup, and OTP verification using JavaScript.</p>';
                            if (name.includes('weather')) return '<p class="proj-desc">Real-time weather forecasting app with API integration and dynamic UI.</p>';
                            if (name.includes('bmi')) return '<p class="proj-desc">Simple BMI calculator measuring body mass index with instant health results.</p>';
                            if (name.includes('password') && name.includes('generator')) return '<p class="proj-desc">Secure random password generator with customizable strength options.</p>';
                            if (name.includes('glow') && name.includes('button')) return '<p class="proj-desc">Modern animated glowing button UI built with advanced CSS effects.</p>';
                            if (name.includes('flames')) return '<p class="proj-desc">Fun relationship calculator app with interactive JavaScript logic and animations.</p>';
                            if (name.includes('qr') && name.includes('code')) return '<p class="proj-desc">Generate QR codes instantly for links, text, and other data with responsive design.</p>';
                            if (name.includes('calculator') && !name.includes('bmi')) return '<p class="proj-desc">Basic calculator for standard arithmetic operations.</p>';
                            if (name.includes('currency')) return '<p class="proj-desc">Real-time currency conversion app with exchange rate API integration.</p>';
                            if (name.includes('portfolio')) return '<p class="proj-desc">Personal futuristic portfolio showcasing projects, skills, and services.</p>';
                            if (name.includes('edutech')) return '<p class="proj-desc">Educational platform UI focused on modern online learning and student interaction.</p>';
                            return '';
                        })()}

                    </div>
                    <div class="proj-buttons">
                        <a href="${repo.html_url}" target="_blank" class="btn btn-outline" style="margin-right:8px;">View Code</a>
                        ${demoUrl ? `<a href="${demoUrl}" target="_blank" class="btn btn-glow">Live Demo</a>` : ''}
                    </div>
                `;
            // Preserve click to open repo (still useful for whole card)
            article.addEventListener('click', (e) => {
                // Prevent click when clicking on buttons
                if (e.target.closest('a')) return;
                window.open(repo.html_url, '_blank');
            });
            article.style.cursor = 'pointer';

            // Re-apply tilt effect
            let r = null;
            article.addEventListener('mouseenter', () => {
                if (window.innerWidth <= 968) return;
                r = article.getBoundingClientRect();
            });
            article.addEventListener('mousemove', e => {
                if (window.innerWidth <= 968) return;
                if (!r) r = article.getBoundingClientRect();
                const x = ((e.clientX - r.left) / r.width - 0.5) * 15;
                const y = ((e.clientY - r.top) / r.height - 0.5) * -15;
                article.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${y}deg) translateY(-8px)`;
            });
            article.addEventListener('mouseleave', () => {
                article.style.transform = '';
                r = null;
            });

            projGrid.appendChild(article);
        });

        // Trigger GSAP animation for new elements
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.fromTo(projGrid.children, { opacity: 0, y: 30 }, {
                opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
                scrollTrigger: { trigger: projGrid, start: 'top 80%', once: true }
            });
            ScrollTrigger.refresh();
        }

    } catch (error) {
        console.error('Error fetching projects:', error);
        projGrid.innerHTML = '<p style="text-align:center;width:100%;">Failed to load projects. Please try again later.</p>';
    }
}

// ===== INITIALIZE PORTFOLIO =====
const mainPortfolio = document.getElementById('mainPortfolio');
if (mainPortfolio) {
    mainPortfolio.classList.add('visible');
    // Initialize GSAP and typing immediately
    setTimeout(() => {
        fetchProjects();
        initGSAP();
        type();
        animateCounters();
    }, 100);
}


// ===== GSAP ANIMATIONS =====
gsap.registerPlugin(ScrollTrigger);

function initGSAP() {
    // Hero Text Animations
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    gsap.set('.profile-photo-wrapper', { opacity: 0, x: -60, scale: 0.85 });
    gsap.set('.hero-name', { opacity: 0, y: 50 });
    gsap.set(['.hero-motto', '.hero-ctas', '.hero-social'], { opacity: 0, y: 30 });

    tl.to('.profile-photo-wrapper', { opacity: 1, x: 0, scale: 1, duration: 1.2 }, 0.2)
        .to('.hero-name', { opacity: 1, y: 0, duration: 1.2 }, 0.4)
        .to('.hero-motto', { opacity: 1, y: 0, duration: 0.8 }, 0.8)
        .to('.hero-ctas', { opacity: 1, y: 0, duration: 0.8 }, 1)
        .to('.hero-social', { opacity: 1, y: 0, duration: 0.8 }, 1.2);

    // Scroll Animations
    document.querySelectorAll('[data-anim="fade"]').forEach(el => {
        if (!el.classList.contains('hero-motto') && !el.classList.contains('hero-ctas') && !el.classList.contains('hero-social')) {
            gsap.fromTo(el, { opacity: 0, y: 40 }, {
                opacity: 1, y: 0, duration: 1, ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 85%', once: true }
            });
        }
    });

    document.querySelectorAll('[data-anim="stagger"]').forEach(g => {
        gsap.fromTo(g.children, { opacity: 0, y: 30 }, {
            opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
            scrollTrigger: { trigger: g, start: 'top 80%', once: true }
        });
    });
}

// ===== FORM SUBMISSION NATIVE (HIDDEN IFRAME) =====
const contactForm = document.getElementById('contactForm');
const hiddenIframe = document.getElementById('hidden_iframe');

if (contactForm && hiddenIframe) {
    contactForm.addEventListener('submit', () => {
        const btn = contactForm.querySelector('button');
        const orig = btn.innerHTML;

        btn.innerHTML = '<span>Sending...</span><i class="fas fa-spinner fa-spin"></i>';

        // When the hidden iframe finishes loading the FormSubmit response
        hiddenIframe.onload = () => {
            btn.innerHTML = '<span>Message Sent!</span><i class="fas fa-check"></i>';
            btn.style.background = '#00e676';
            btn.style.color = '#000';
            btn.style.borderColor = '#00e676';

            setTimeout(() => {
                btn.innerHTML = orig;
                btn.style.background = '';
                btn.style.color = '';
                btn.style.borderColor = '';
                contactForm.reset();
            }, 3000);
        };
    });
}

