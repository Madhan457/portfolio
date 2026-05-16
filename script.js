// ===== CUSTOM CURSOR =====
const cursor = document.getElementById('cursor');
const glow = document.getElementById('cursorGlow');
let cx = 0, cy = 0, gx = 0, gy = 0;
document.addEventListener('mousemove', e => { cx = e.clientX; cy = e.clientY; });
(function moveCursor() {
    cursor.style.left = cx + 'px'; cursor.style.top = cy + 'px';
    gx += (cx - gx) * 0.08; gy += (cy - gy) * 0.08;
    glow.style.left = gx + 'px'; glow.style.top = gy + 'px';
    requestAnimationFrame(moveCursor);
})();

// ===== MAGNETIC BUTTONS =====
document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const s = +(el.dataset.strength || 15);
        const dx = (e.clientX - r.left - r.width / 2) / r.width * s;
        const dy = (e.clientY - r.top - r.height / 2) / r.height * s;
        el.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
});

// ===== LOADER =====
const loader = document.getElementById('loader');
const loaderFill = document.getElementById('loaderFill');
const loaderPct = document.getElementById('loaderPct');
let progress = 0;
const loadInt = setInterval(() => {
    progress += Math.random() * 12 + 3;
    if (progress >= 100) { progress = 100; clearInterval(loadInt); }
    loaderFill.style.width = progress + '%';
    loaderPct.textContent = Math.floor(progress) + '%';
    if (progress === 100) setTimeout(() => { loader.classList.add('done'); startHero(); }, 500);
}, 150);

// ===== PARTICLE CANVAS =====
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let pts = [];
function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
resize(); addEventListener('resize', resize);
class P {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height;
        this.s = Math.random() * 1.5 + .3;
        this.vx = (Math.random() - .5) * .25; this.vy = (Math.random() - .5) * .25;
        this.a = Math.random() * .25 + .03;
    }
    update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
    }
    draw() {
        ctx.beginPath(); ctx.arc(this.x, this.y, this.s, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,194,255,${this.a})`; ctx.fill();
    }
}
const n = Math.min(90, Math.floor(innerWidth * innerHeight / 14000));
for (let i = 0; i < n; i++) pts.push(new P());
(function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < pts.length; i++) {
        pts[i].update(); pts[i].draw();
        for (let j = i + 1; j < pts.length; j++) {
            const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 130) {
                ctx.beginPath(); ctx.strokeStyle = `rgba(0,194,255,${.035 * (1 - d / 130)})`;
                ctx.lineWidth = .4; ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animate);
})();

// ===== TYPING ANIMATION =====
const phrases = ['Full Stack Developer', 'Web App Developer', 'Founder of Innovexa Techno', 'Software Engineer', 'UI/UX Designer'];
const typingEl = document.getElementById('typingText');
let pi = 0, ci = 0, deleting = false;
function type() {
    const current = phrases[pi];
    if (!deleting) {
        typingEl.textContent = current.substring(0, ci + 1);
        ci++;
        if (ci === current.length) { deleting = true; setTimeout(type, 2000); return; }
        setTimeout(type, 80);
    } else {
        typingEl.textContent = current.substring(0, ci - 1);
        ci--;
        if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; setTimeout(type, 400); return; }
        setTimeout(type, 40);
    }
}

// ===== GSAP HERO ANIMATION =====
gsap.registerPlugin(ScrollTrigger);

function startHero() {
    type(); // start typing
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    // Text mask animation for name
    const nameEl = document.querySelector('.hero-name');
    const nameText = nameEl.textContent;
    nameEl.innerHTML = `<span class="hero-name-inner">${nameText}</span>`;
    tl.to('.hero-name-inner', { y: 0, duration: 1.4, ease: 'power4.out' }, 0)
      .to('.hero-greeting', { opacity: 1, duration: .8 }, 0)
      .to('.hero-desc', { opacity: 1, y: 0, duration: .8 }, .5)
      .to('.hero-motto', { opacity: 1, y: 0, duration: .8 }, .7)
      .to('.hero-ctas', { opacity: 1, y: 0, duration: .8 }, .9)
      .to('.hero-social', { opacity: 1, y: 0, duration: .8 }, 1.1);
    gsap.set(['.hero-desc', '.hero-motto', '.hero-ctas', '.hero-social'], { y: 25 });
    gsap.set('.hero-name-inner', { y: '110%' });
}

// ===== SCROLL ANIMATIONS =====
document.querySelectorAll('[data-anim="fade"]').forEach(el => {
    gsap.fromTo(el, { opacity: 0, y: 50 }, {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true }
    });
});
document.querySelectorAll('[data-anim="stagger"]').forEach(g => {
    gsap.fromTo(g.children, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: .8, stagger: .1, ease: 'power3.out',
        scrollTrigger: { trigger: g, start: 'top 80%', once: true }
    });
});
document.querySelectorAll('[data-anim="reveal"]').forEach(el => {
    gsap.fromTo(el, { clipPath: 'inset(100% 0 0 0)' }, {
        clipPath: 'inset(0% 0 0 0)', duration: 1.2, ease: 'power4.inOut',
        scrollTrigger: { trigger: el, start: 'top 80%', once: true }
    });
});

// Skill bars
document.querySelectorAll('.sk-fill').forEach(b => {
    ScrollTrigger.create({ trigger: b, start: 'top 90%', once: true,
        onEnter: () => { b.style.width = b.dataset.w + '%'; }
    });
});

// ===== NAVBAR =====
const nav = document.getElementById('nav');
addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 80));
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
burger.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(l => l.addEventListener('click', () => navLinks.classList.remove('open')));
// Active link
const secs = document.querySelectorAll('section[id]');
addEventListener('scroll', () => {
    const y = scrollY + 200;
    secs.forEach(s => {
        const link = document.querySelector(`.nav-links a[data-section="${s.id}"]`);
        if (link) link.classList.toggle('active', y >= s.offsetTop && y < s.offsetTop + s.offsetHeight);
    });
});

// ===== COUNTERS =====
document.querySelectorAll('.ctr-n').forEach(el => {
    ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true,
        onEnter: () => {
            const t = +el.dataset.target; let c = 0;
            const timer = setInterval(() => { c += Math.ceil(t / 35); if (c >= t) { c = t; clearInterval(timer); } el.textContent = c; }, 40);
        }
    });
});

// ===== 3D TILT =====
document.querySelectorAll('.proj-card, .sk, .testi-card, .service-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - .5) * 10;
        const y = ((e.clientY - r.top) / r.height - .5) * -10;
        card.style.transform = `perspective(800px) rotateY(${x}deg) rotateX(${y}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

// ===== PARALLAX HERO =====
addEventListener('scroll', () => {
    const y = scrollY;
    const hero = document.querySelector('.hero-inner');
    if (hero && y < innerHeight) {
        hero.style.transform = `translateY(${y * .3}px)`;
        hero.style.opacity = 1 - (y / innerHeight) * .7;
    }
});

// ===== CONTACT FORM =====
document.getElementById('contactForm').addEventListener('submit', e => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const orig = btn.innerHTML;
    btn.innerHTML = '<span>Sent!</span><i class="fas fa-check"></i>';
    btn.style.background = '#00ff88'; btn.style.color = '#000';
    setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; btn.style.color = ''; e.target.reset(); }, 3000);
});
