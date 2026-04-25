/**
 * Blog Listing JavaScript
 * Fetches posts.json and renders blog cards with tag filtering
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
        const rawData = await response.json();
        const posts = Array.isArray(rawData) ? rawData : (rawData?.posts || []);

        if (!posts || posts.length === 0) {
            grid.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        // Sort by date (newest first)
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Extract unique tags
        const allTags = new Set();
        posts.forEach(post => {
            if (post.tags) post.tags.forEach(tag => allTags.add(tag));
        });

        // Build filter buttons
        if (filtersContainer && allTags.size > 0) {
            allTags.forEach(tag => {
                const btn = document.createElement('button');
                btn.className = 'filter-btn';
                btn.dataset.filter = tag;
                btn.textContent = tag;
                filtersContainer.appendChild(btn);
            });

            // Attach filter events
            filtersContainer.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    filtersContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    renderPosts(posts, grid, btn.dataset.filter);
                });
            });
        }

        // Initial render
        renderPosts(posts, grid, 'all');

    } catch (error) {
        console.log('No blog posts found yet. Add posts via the CMS or by editing content/blog/posts.json');
        grid.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
    }
}

function renderPosts(posts, grid, filter) {
    const filtered = filter === 'all'
        ? posts
        : posts.filter(p => p.tags && p.tags.includes(filter));

    if (filtered.length === 0) {
        grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">🔍</div>
        <h3>No posts found</h3>
        <p>No posts match the selected filter.</p>
      </div>
    `;
        return;
    }

    grid.innerHTML = filtered.map(post => `
    <a href="post.html?slug=${encodeURIComponent(post.slug)}" class="blog-card" style="text-decoration: none;">
      <div class="blog-card-content">
        <div class="blog-card-meta">
          <span class="blog-card-date">${formatDate(post.date)}</span>
          ${post.tags ? post.tags.slice(0, 2).map(tag =>
        `<span class="blog-card-tag">${tag}</span>`
    ).join('') : ''}
        </div>
        <h3 class="blog-card-title">${escapeHtml(post.title)}</h3>
        <p class="blog-card-excerpt">${escapeHtml(post.excerpt)}</p>
        <span class="blog-card-link">Read more →</span>
      </div>
    </a>
  `).join('');
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
