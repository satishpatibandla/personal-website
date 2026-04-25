/**
 * Main JavaScript — Navigation, Scroll, Animations, Typing Effect, Contact Form
 * Satish Patibandla Personal Website
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initMobileMenu();
    initScrollAnimations();
    initSkillBarAnimation();
    initContactForm();
    initTypingEffect();
    initParticles();
});

/* --- Navbar Scroll Effect --- */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    if (!navbar.classList.contains('scrolled')) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Active nav link highlighting for homepage sections
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

    if (sections.length > 0 && navLinks.length > 0) {
        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 100;
                if (window.scrollY >= sectionTop) {
                    current = section.getAttribute('id');
                }
            });
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });
    }
}

/* --- Mobile Menu --- */
function initMobileMenu() {
    const toggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const overlay = document.getElementById('navOverlay');

    if (!toggle || !navLinks) return;

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        navLinks.classList.toggle('open');
        if (overlay) overlay.classList.toggle('visible');
        document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            navLinks.classList.remove('open');
            if (overlay) overlay.classList.remove('visible');
            document.body.style.overflow = '';
        });
    });

    if (overlay) {
        overlay.addEventListener('click', () => {
            toggle.classList.remove('active');
            navLinks.classList.remove('open');
            overlay.classList.remove('visible');
            document.body.style.overflow = '';
        });
    }
}

/* --- Scroll Animations (Intersection Observer) --- */
function initScrollAnimations() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, index * 100);
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    elements.forEach(el => observer.observe(el));
}

/* --- Skill Bar Scroll Animation --- */
function initSkillBarAnimation() {
    const skillBars = document.querySelectorAll('.skill-bar-fill[data-width]');
    if (skillBars.length === 0) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    const targetWidth = bar.getAttribute('data-width');
                    // Small delay for visual effect
                    setTimeout(() => {
                        bar.style.width = targetWidth + '%';
                        bar.classList.add('animated');
                    }, 200);
                    observer.unobserve(bar);
                }
            });
        },
        { threshold: 0.3 }
    );

    skillBars.forEach(bar => observer.observe(bar));
}

/* --- Typing Effect --- */
function initTypingEffect() {
    const typingEl = document.getElementById('typingText');
    if (!typingEl) return;

    const phrases = [
        'AI Engineer',
        'Developer',
        'Writer',
        'Lifelong Learner',
        'Problem Solver'
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let currentText = '';

    function typeChar() {
        const currentPhrase = phrases[phraseIndex];

        if (isDeleting) {
            currentText = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
        } else {
            currentText = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
        }

        typingEl.textContent = currentText;

        let delay = isDeleting ? 50 : 100;

        if (!isDeleting && charIndex === currentPhrase.length) {
            delay = 2000; // Pause at end
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            delay = 500; // Pause before next word
        }

        setTimeout(typeChar, delay);
    }

    // Start typing after hero animation
    setTimeout(typeChar, 1500);
}

/* --- Floating Particles --- */
function initParticles() {
    const container = document.getElementById('heroParticles');
    if (!container) return;

    for (let i = 0; i < 25; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 8 + 6) + 's';
        particle.style.animationDelay = (Math.random() * 5) + 's';
        particle.style.width = (Math.random() * 3 + 1) + 'px';
        particle.style.height = particle.style.width;
        container.appendChild(particle);
    }
}

/* --- Contact Form Handling (mailto fallback for static sites) --- */
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = form.querySelector('#name').value.trim();
        const email = form.querySelector('#email').value.trim();
        const message = form.querySelector('#message').value.trim();

        if (!name || !email || !message) return;

        const successMsg = document.getElementById('formSuccess');
        const errorMsg = document.getElementById('formError');
        const submitBtn = form.querySelector('button[type="submit"]');

        // Try Netlify Forms first (works when deployed on Netlify)
        const formData = new FormData(form);
        formData.append('form-name', 'contact');

        fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(formData).toString()
        })
            .then(response => {
                if (response.ok) {
                    showFormSuccess(form, successMsg);
                } else {
                    // Fallback: open mailto link
                    openMailto(name, email, message);
                    showFormSuccess(form, successMsg);
                }
            })
            .catch(() => {
                // Offline or not on Netlify: open mailto link
                openMailto(name, email, message);
                showFormSuccess(form, successMsg);
            });
    });
}

function openMailto(name, email, message) {
    const subject = encodeURIComponent(`Message from ${name} via Portfolio`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.open(`mailto:stshpatibandla@gmail.com?subject=${subject}&body=${body}`, '_self');
}

function showFormSuccess(form, successMsg) {
    form.reset();
    if (successMsg) {
        successMsg.classList.add('visible');
        setTimeout(() => successMsg.classList.remove('visible'), 5000);
    }
}
