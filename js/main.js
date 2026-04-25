/**
 * Shared site JavaScript: navigation, CMS-rendered homepage, animations, and contact form.
 */

document.addEventListener('DOMContentLoaded', async () => {
    initNavbar();
    initMobileMenu();
    initParticles();
    const settings = await loadSiteSettings();
    await loadHomeContent(settings);
    initScrollAnimations();
    initSkillBarAnimation();
    initContactForm(settings);
    initTypingEffect(settings?.hero?.roles);
});

async function fetchJson(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Could not load ${path}`);
    return response.json();
}

async function loadSiteSettings() {
    try {
        const settings = await fetchJson('content/site/settings.json');
        renderSiteSettings(settings);
        return settings;
    } catch (error) {
        console.warn('Using fallback site settings.', error);
        return null;
    }
}

function renderSiteSettings(settings) {
    const brand = settings.brand || {};
    const hero = settings.hero || {};
    const about = settings.about || {};
    const resume = settings.resume || {};
    const contact = settings.contact || {};

    setText('navLogo', brand.shortName || brand.name);
    setText('footerName', brand.footerName || brand.name);
    setText('heroEyebrow', hero.eyebrow);
    setHeroName(hero.name || brand.name);
    setText('heroSummary', hero.summary);
    setText('heroPanelTitle', hero.panelTitle);
    setText('heroPanelText', hero.panelText);
    setText('aboutHeading', about.heading);
    setText('aboutIntro', about.intro);
    setText('skillsHeading', 'What I work with');
    setText('contactHeading', contact.heading);
    setText('contactIntro', contact.intro);

    setLink('primaryCta', hero.primaryCtaText, hero.primaryCtaUrl);
    setLink('secondaryCta', hero.secondaryCtaText, hero.secondaryCtaUrl);
    setLink('resumeLink', resume.label, resume.file);

    const profileImage = document.getElementById('profileImage');
    if (profileImage && brand.profileImage) profileImage.src = brand.profileImage;

    renderSignals(hero.signals || []);
    renderAbout(about);
    renderSkills(settings.skills || []);
    renderSocialLinks(settings.socials || []);
    renderContactLinks(contact, settings.socials || []);
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el && value) el.textContent = value;
}

function setLink(id, label, url) {
    const el = document.getElementById(id);
    if (!el) return;
    if (label) el.textContent = label;
    if (url) el.href = url;
}

function setHeroName(name) {
    const el = document.getElementById('heroName');
    if (!el || !name) return;
    const parts = name.trim().split(/\s+/);
    const last = parts.pop();
    const first = parts.join(' ');
    el.innerHTML = `${escapeHtml(first || name)}${last && first ? ' ' : ''}<span class="highlight">${escapeHtml(last && first ? last : '')}</span>`;
}

function renderSignals(signals) {
    const container = document.getElementById('heroSignals');
    if (!container) return;
    container.innerHTML = signals.map((signal) => `<span>${escapeHtml(signal)}</span>`).join('');
}

function renderAbout(about) {
    const body = document.getElementById('aboutBody');
    const stats = document.getElementById('statsGrid');
    const details = document.getElementById('aboutDetails');

    if (body) {
        body.innerHTML = (about.paragraphs || [])
            .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
            .join('');
    }

    if (stats) {
        stats.innerHTML = (about.stats || [])
            .map((stat) => `
                <div class="stat-item">
                    <span class="stat-number">${escapeHtml(stat.value)}</span>
                    <span class="stat-label">${escapeHtml(stat.label)}</span>
                </div>
            `)
            .join('');
    }

    if (details) {
        details.innerHTML = (about.details || [])
            .map((item) => `
                <div class="about-detail">
                    <span class="icon">${escapeHtml(item.label)}</span>
                    <span>${escapeHtml(item.value)}</span>
                </div>
            `)
            .join('');
    }
}

function renderSkills(skills) {
    const grid = document.getElementById('skillsGrid');
    if (!grid) return;

    grid.innerHTML = skills.map((group) => `
        <article class="skill-category animate-on-scroll">
            <div class="skill-category-header">
                <div class="skill-category-icon">${escapeHtml(group.icon || group.category.slice(0, 2))}</div>
                <h3 class="skill-category-title">${escapeHtml(group.category)}</h3>
            </div>
            <div class="skill-list">
                ${(group.items || []).map((skill) => `
                    <div class="skill-item">
                        <div class="skill-item-header">
                            <span class="skill-name">${escapeHtml(skill.name)}</span>
                            <span class="skill-level">${escapeHtml(skill.level || `${skill.percent || 0}%`)}</span>
                        </div>
                        <div class="skill-bar">
                            <div class="skill-bar-fill" data-width="${Number(skill.percent || 0)}"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </article>
    `).join('');
}

function renderSocialLinks(socials) {
    const container = document.getElementById('socialLinks');
    if (!container) return;
    container.innerHTML = socials.map((social) => `
        <a class="social-link" href="${escapeAttribute(social.url)}" target="_blank" rel="noopener noreferrer"
            aria-label="${escapeAttribute(social.label)}">${escapeHtml(social.label.slice(0, 2))}</a>
    `).join('');
}

function renderContactLinks(contact, socials) {
    const container = document.getElementById('contactLinks');
    if (!container) return;
    const links = [];
    if (contact.email) {
        links.push({ label: contact.email, url: `mailto:${contact.email}` });
    }
    if (contact.location) {
        links.push({ label: contact.location, url: '' });
    }
    links.push(...socials);

    container.innerHTML = links.map((link) => {
        if (!link.url) {
            return `<div class="contact-link-item"><span class="contact-link-icon">LOC</span><span>${escapeHtml(link.label)}</span></div>`;
        }
        return `
            <a class="contact-link-item" href="${escapeAttribute(link.url)}" target="_blank" rel="noopener noreferrer">
                <span class="contact-link-icon">${escapeHtml(link.label.slice(0, 2))}</span>
                <span>${escapeHtml(link.label)}</span>
            </a>
        `;
    }).join('');
}

async function loadHomeContent(settings) {
    await Promise.all([
        loadHomePosts(settings?.homepage?.postLimit || 3),
        loadHomeResources(settings?.homepage?.resourceLimit || 3),
    ]);
}

async function loadHomePosts(limit) {
    const grid = document.getElementById('homeBlogGrid');
    const empty = document.getElementById('homeBlogEmpty');
    if (!grid) return;

    try {
        const raw = await fetchJson('content/blog/posts.json');
        const posts = normalizePosts(raw).slice(0, limit);
        if (posts.length === 0) throw new Error('No posts');
        grid.innerHTML = posts.map(renderPostCard).join('');
        grid.style.display = '';
        if (empty) empty.style.display = 'none';
    } catch (error) {
        grid.style.display = 'none';
        if (empty) empty.style.display = 'block';
    }
}

async function loadHomeResources(limit) {
    const grid = document.getElementById('homeResourcesGrid');
    const empty = document.getElementById('homeResourcesEmpty');
    if (!grid) return;

    try {
        const raw = await fetchJson('content/resources/resources.json');
        const resources = normalizeResources(raw).slice(0, limit);
        if (resources.length === 0) throw new Error('No resources');
        grid.innerHTML = resources.map(renderResourceCard).join('');
        grid.style.display = '';
        if (empty) empty.style.display = 'none';
    } catch (error) {
        grid.style.display = 'none';
        if (empty) empty.style.display = 'block';
    }
}

function normalizePosts(raw) {
    const posts = Array.isArray(raw) ? raw : (raw?.posts || []);
    return posts
        .filter((post) => post && post.slug && post.title)
        .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || new Date(b.date || 0) - new Date(a.date || 0));
}

function normalizeResources(raw) {
    const resources = Array.isArray(raw) ? raw : (raw?.resources || []);
    return resources
        .filter((resource) => resource && resource.title)
        .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || new Date(b.date || 0) - new Date(a.date || 0));
}

function renderPostCard(post) {
    return `
        <a href="post.html?slug=${encodeURIComponent(post.slug)}" class="blog-card animate-on-scroll">
            ${post.featuredImage ? `<div class="blog-card-image"><img src="${escapeAttribute(post.featuredImage)}" alt=""></div>` : ''}
            <div class="blog-card-content">
                <div class="blog-card-meta">
                    <span class="blog-card-date">${formatDate(post.date)}</span>
                    ${(post.tags || []).slice(0, 2).map((tag) => `<span class="blog-card-tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
                <h3 class="blog-card-title">${escapeHtml(post.title)}</h3>
                <p class="blog-card-excerpt">${escapeHtml(post.excerpt || '')}</p>
                <span class="blog-card-link">Read post</span>
            </div>
        </a>
    `;
}

function renderResourceCard(resource) {
    const href = resource.externalUrl || resource.file;
    const action = href
        ? `<a href="${escapeAttribute(href)}" class="btn btn-primary btn-sm" target="_blank" rel="noopener noreferrer">Open</a>`
        : `<span class="btn btn-secondary btn-sm disabled">Coming soon</span>`;

    return `
        <article class="resource-card animate-on-scroll">
            <div class="resource-icon">${escapeHtml(resource.type || 'Doc')}</div>
            <h3 class="resource-card-title">${escapeHtml(resource.title)}</h3>
            <p class="resource-card-description">${escapeHtml(resource.description || '')}</p>
            <div class="resource-card-meta">
                <span class="resource-card-date">${formatDate(resource.date)}</span>
                <span class="resource-card-type">${escapeHtml(resource.category || 'Other')}</span>
            </div>
            <div class="resource-card-actions">${action}</div>
        </article>
    `;
}

function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    if (!navbar.classList.contains('scrolled')) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    if (sections.length === 0 || navLinks.length === 0) return;

    window.addEventListener('scroll', () => {
        let current = 'home';
        sections.forEach((section) => {
            if (window.scrollY >= section.offsetTop - 120) current = section.id;
        });
        navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });
    });
}

function initMobileMenu() {
    const toggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const overlay = document.getElementById('navOverlay');
    if (!toggle || !navLinks) return;

    const close = () => {
        toggle.classList.remove('active');
        navLinks.classList.remove('open');
        if (overlay) overlay.classList.remove('visible');
        document.body.style.overflow = '';
    };

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        navLinks.classList.toggle('open');
        if (overlay) overlay.classList.toggle('visible');
        document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    navLinks.querySelectorAll('a').forEach((link) => link.addEventListener('click', close));
    if (overlay) overlay.addEventListener('click', close);
}

function initScrollAnimations() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    if (elements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add('visible'), index * 80);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    elements.forEach((el) => observer.observe(el));
}

function initSkillBarAnimation() {
    const skillBars = document.querySelectorAll('.skill-bar-fill[data-width]');
    if (skillBars.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                setTimeout(() => {
                    bar.style.width = `${bar.getAttribute('data-width')}%`;
                    bar.classList.add('animated');
                }, 150);
                observer.unobserve(bar);
            }
        });
    }, { threshold: 0.3 });

    skillBars.forEach((bar) => observer.observe(bar));
}

function initTypingEffect(phrases) {
    const typingEl = document.getElementById('typingText');
    if (!typingEl) return;

    const source = Array.isArray(phrases) && phrases.length > 0 ? phrases : ['AI Engineer', 'Developer', 'Problem Solver'];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeChar() {
        const currentPhrase = source[phraseIndex];
        typingEl.textContent = currentPhrase.substring(0, charIndex + (isDeleting ? -1 : 1));
        charIndex += isDeleting ? -1 : 1;

        let delay = isDeleting ? 45 : 90;
        if (!isDeleting && charIndex === currentPhrase.length) {
            delay = 1800;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % source.length;
            delay = 400;
        }

        setTimeout(typeChar, delay);
    }

    setTimeout(typeChar, 800);
}

function initParticles() {
    const container = document.getElementById('heroParticles');
    if (!container) return;

    for (let i = 0; i < 28; i += 1) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animationDuration = `${Math.random() * 8 + 6}s`;
        particle.style.animationDelay = `${Math.random() * 5}s`;
        const size = Math.random() * 3 + 1;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        container.appendChild(particle);
    }
}

function initContactForm(settings) {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = form.querySelector('#name').value.trim();
        const email = form.querySelector('#email').value.trim();
        const message = form.querySelector('#message').value.trim();
        if (!name || !email || !message) return;

        const successMsg = document.getElementById('formSuccess');
        const formData = new FormData(form);
        formData.append('form-name', 'contact');

        fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(formData).toString(),
        })
            .then((response) => {
                if (!response.ok) openMailto(settings, name, email, message);
                showFormSuccess(form, successMsg);
            })
            .catch(() => {
                openMailto(settings, name, email, message);
                showFormSuccess(form, successMsg);
            });
    });
}

function openMailto(settings, name, email, message) {
    const to = settings?.contact?.email || 'stshpatibandla@gmail.com';
    const subject = encodeURIComponent(`Message from ${name} via Portfolio`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.open(`mailto:${to}?subject=${subject}&body=${body}`, '_self');
}

function showFormSuccess(form, successMsg) {
    form.reset();
    if (!successMsg) return;
    successMsg.classList.add('visible');
    setTimeout(() => successMsg.classList.remove('visible'), 5000);
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value == null ? '' : String(value);
    return div.innerHTML;
}

function escapeAttribute(value) {
    return escapeHtml(value).replace(/"/g, '&quot;');
}
