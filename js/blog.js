/**
 * Blog listing rendered from the CMS-generated post index.
 */

document.addEventListener('DOMContentLoaded', () => {
    loadBlogPosts();
});

async function loadBlogPosts() {
    const grid = document.getElementById('blogGrid');
    const emptyState = document.getElementById('blogEmpty');
    const filtersContainer = document.getElementById('blogFilters');
    if (!grid) return;

    try {
        const response = await fetch('content/blog/posts.json');
        if (!response.ok) throw new Error('Missing posts index');
        const rawData = await response.json();
        const posts = normalizePosts(rawData);

        if (posts.length === 0) {
            showEmpty(grid, emptyState);
            return;
        }

        renderFilters(posts, filtersContainer, grid);
        renderPosts(posts, grid, 'all');
    } catch (error) {
        console.warn('No blog posts found yet.', error);
        showEmpty(grid, emptyState);
    }
}

function normalizePosts(rawData) {
    const posts = Array.isArray(rawData) ? rawData : (rawData?.posts || []);
    return posts
        .filter((post) => post && post.slug && post.title)
        .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || new Date(b.date || 0) - new Date(a.date || 0));
}

function renderFilters(posts, filtersContainer, grid) {
    if (!filtersContainer) return;
    const allTags = new Set();
    posts.forEach((post) => (post.tags || []).forEach((tag) => allTags.add(tag)));

    allTags.forEach((tag) => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.dataset.filter = tag;
        btn.textContent = tag;
        filtersContainer.appendChild(btn);
    });

    filtersContainer.querySelectorAll('.filter-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            filtersContainer.querySelectorAll('.filter-btn').forEach((item) => item.classList.remove('active'));
            btn.classList.add('active');
            renderPosts(posts, grid, btn.dataset.filter);
        });
    });
}

function renderPosts(posts, grid, filter) {
    const filtered = filter === 'all'
        ? posts
        : posts.filter((post) => (post.tags || []).includes(filter));

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-state-icon">POST</div>
                <h3>No posts found</h3>
                <p>No posts match the selected filter.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map((post) => `
        <a href="post.html?slug=${encodeURIComponent(post.slug)}" class="blog-card">
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
    `).join('');
}

function showEmpty(grid, emptyState) {
    grid.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
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
