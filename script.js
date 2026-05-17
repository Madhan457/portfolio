// ===== CUSTOM CURSOR =====
const cursor = document.getElementById('cursor');
const glow = document.getElementById('cursorGlow');
let cx = 0, cy = 0, gx = 0, gy = 0;
document.addEventListener('mousemove', e => { 
    cx = e.clientX; 
    cy = e.clientY; 
});
(function moveCursor() {
    if (cursor && glow) {
        cursor.style.left = cx + 'px'; 
        cursor.style.top = cy + 'px';
        gx += (cx - gx) * 0.08; 
        gy += (cy - gy) * 0.08;
        glow.style.left = gx + 'px'; 
        glow.style.top = gy + 'px';
    }
    requestAnimationFrame(moveCursor);
})();

// ===== THEME TOGGLE =====
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
});

// ===== MAGNETIC BUTTONS =====
document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const s = +(el.dataset.strength || 15);
        const dx = (e.clientX - r.left - r.width / 2) / r.width * s;
        const dy = (e.clientY - r.top - r.height / 2) / r.height * s;
        el.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    el.addEventListener('mouseleave', () => { 
        el.style.transform = ''; 
    });
});

// ===== 3D TILT EFFECT =====
document.querySelectorAll('.glass-card, .sk').forEach(card => {
    card.addEventListener('mousemove', e => {
        if (window.innerWidth <= 968) return; // Disable on touch/small screens
        const r = card.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - 0.5) * 15;
        const y = ((e.clientY - r.top) / r.height - 0.5) * -15;
        card.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${y}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => { 
        card.style.transform = ''; 
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
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    navLinks.style.flexDirection = 'column';
    navLinks.style.position = 'absolute';
    navLinks.style.top = '80px';
    navLinks.style.left = '0';
    navLinks.style.right = '0';
    navLinks.style.background = 'var(--bg-glass)';
    navLinks.style.backdropFilter = 'blur(20px)';
    navLinks.style.padding = '2rem';
});

// ===== TYPING ANIMATION =====
const phrases = ['Website Developer', 'Software Engineer', 'UI/UX Designer'];
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

// ===== INITIALIZE PORTFOLIO =====
const mainPortfolio = document.getElementById('mainPortfolio');
if (mainPortfolio) {
    mainPortfolio.classList.add('visible');
    // Initialize GSAP and typing immediately
    setTimeout(() => {
        initGSAP();
        type();
    }, 100);
}


// ===== GSAP ANIMATIONS =====
gsap.registerPlugin(ScrollTrigger);

function initGSAP() {
    // Hero Text Animations
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    
    gsap.set('.hero-name', { opacity: 0, y: 50 });
    gsap.set(['.hero-motto', '.hero-ctas', '.hero-social'], { opacity: 0, y: 30 });
    
    tl.to('.hero-name', { opacity: 1, y: 0, duration: 1.2 }, 0.4)
      .to('.hero-motto', { opacity: 1, y: 0, duration: 0.8 }, 0.8)
      .to('.hero-ctas', { opacity: 1, y: 0, duration: 0.8 }, 1)
      .to('.hero-social', { opacity: 1, y: 0, duration: 0.8 }, 1.2);

    // Scroll Animations
    document.querySelectorAll('[data-anim="fade"]').forEach(el => {
        if(!el.classList.contains('hero-motto') && !el.classList.contains('hero-ctas') && !el.classList.contains('hero-social')) {
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

// ===== FORM SUBMISSION =====
document.getElementById('contactForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const orig = btn.innerHTML;
    btn.innerHTML = '<span>Message Sent!</span><i class="fas fa-check"></i>';
    btn.style.background = '#00e676';
    btn.style.color = '#000';
    btn.style.borderColor = '#00e676';
    setTimeout(() => {
        btn.innerHTML = orig;
        btn.style.background = '';
        btn.style.color = '';
        btn.style.borderColor = '';
        e.target.reset();
    }, 3000);
});
