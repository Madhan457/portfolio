// ===== Particle System =====
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let mouse = { x: null, y: null };

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
document.addEventListener('mousemove', (e) => { mouse.x = e.x; mouse.y = e.y; });

class Particle {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.1;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
        if (mouse.x !== null) {
            const dx = mouse.x - this.x, dy = mouse.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                this.x -= dx * 0.01;
                this.y -= dy * 0.01;
            }
        }
    }
    draw() {
        const theme = document.documentElement.getAttribute('data-theme');
        const color = theme === 'light' ? '100, 100, 200' : '0, 180, 255';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${this.opacity})`;
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
    for (let i = 0; i < count; i++) particles.push(new Particle());
}
initParticles();

function connectParticles() {
    const theme = document.documentElement.getAttribute('data-theme');
    const color = theme === 'light' ? '100, 100, 200' : '0, 180, 255';
    for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
            const dx = particles[a].x - particles[b].x;
            const dy = particles[a].y - particles[b].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(${color}, ${0.06 * (1 - dist / 150)})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(particles[a].x, particles[a].y);
                ctx.lineTo(particles[b].x, particles[b].y);
                ctx.stroke();
            }
        }
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    connectParticles();
    requestAnimationFrame(animateParticles);
}
animateParticles();

// ===== Theme Toggle =====
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const html = document.documentElement;

function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    themeIcon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    localStorage.setItem('portfolio-theme', theme);
}

themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
});

const saved = localStorage.getItem('portfolio-theme');
if (saved) setTheme(saved);

// ===== Navbar Scroll Effect =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ===== Mobile Menu Toggle =====
const mobileToggle = document.getElementById('mobileToggle');
const navLinks = document.getElementById('navLinks');
mobileToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileToggle.classList.toggle('active');
});
navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileToggle.classList.remove('active');
    });
});

// ===== Active Nav Link =====
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 200;
    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        const link = document.querySelector(`.nav-link[href="#${id}"]`);
        if (link) {
            link.classList.toggle('active', scrollY >= top && scrollY < top + height);
        }
    });
});

// ===== Scroll Reveal =====
const revealElements = document.querySelectorAll(
    '.section-header, .about-card, .code-window, .skill-card, .project-card, .service-card, .contact-info, .contact-form'
);
revealElements.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), index * 80);
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

revealElements.forEach(el => revealObserver.observe(el));

// ===== Counter Animation =====
const statNumbers = document.querySelectorAll('.stat-number');
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.getAttribute('data-target'));
            let current = 0;
            const increment = Math.ceil(target / 40);
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) { current = target; clearInterval(timer); }
                el.textContent = current;
            }, 40);
            counterObserver.unobserve(el);
        }
    });
}, { threshold: 0.5 });
statNumbers.forEach(el => counterObserver.observe(el));

// ===== Skill Card Tilt =====
document.querySelectorAll('.skill-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 15;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * -15;
        card.style.transform = `perspective(600px) rotateY(${x}deg) rotateX(${y}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(600px) rotateY(0) rotateX(0) translateY(0)';
    });
});

// ===== Contact Form =====
document.getElementById('contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.innerHTML = '<span>Message Sent!</span> <i class="fas fa-check"></i>';
    btn.style.background = 'linear-gradient(135deg, #00ff88, #00b4ff)';
    setTimeout(() => {
        btn.innerHTML = '<span>Send Message</span> <i class="fas fa-paper-plane"></i>';
        btn.style.background = '';
        e.target.reset();
    }, 3000);
});

// ===== Typing Effect for Code Block =====
const codeBody = document.querySelector('.code-body code');
if (codeBody) {
    const originalHTML = codeBody.innerHTML;
    codeBody.innerHTML = '';
    let i = 0;
    const codeObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            const rawText = originalHTML;
            function typeCode() {
                if (i < rawText.length) {
                    // Handle HTML tags - add them instantly
                    if (rawText[i] === '<') {
                        const closeIdx = rawText.indexOf('>', i);
                        codeBody.innerHTML += rawText.substring(i, closeIdx + 1);
                        i = closeIdx + 1;
                    } else {
                        codeBody.innerHTML += rawText[i];
                        i++;
                    }
                    setTimeout(typeCode, 15);
                }
            }
            typeCode();
            codeObserver.unobserve(codeBody);
        }
    }, { threshold: 0.3 });
    codeObserver.observe(codeBody);
}
