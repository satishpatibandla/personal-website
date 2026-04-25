/**
 * Blog post detail page rendered from the CMS-generated post index.
 */

document.addEventListener('DOMContentLoaded', () => {
    loadPost();
});

async function loadPost() {
    const titleEl = document.getElementById('postTitle');
    const dateEl = document.getElementById('postDate');
    const tagsEl = document.getElementById('postTags');
    const bodyEl = document.getElementById('postBody');
    const imageEl = document.getElementById('postImage');

    const slug = new URLSearchParams(window.location.search).get('slug');
    if (!slug) {
        showError('No post specified.');
        return;
    }

    try {
        const metaResponse = await fetch('content/blog/posts.json');
        if (!metaResponse.ok) throw new Error('Missing posts index');
        const rawData = await metaResponse.json();
        const posts = Array.isArray(rawData) ? rawData : (rawData?.posts || []);
        const post = posts.find((item) => item.slug === slug);

        if (!post) {
            showError('Post not found.');
            return;
        }

        document.title = `${post.title} - Satish Patibandla`;
        if (titleEl) titleEl.textContent = post.title;
        if (dateEl) dateEl.textContent = formatDate(post.date);
        if (tagsEl) {
            tagsEl.innerHTML = (post.tags || []).map((tag) => `<span class="blog-card-tag">${escapeHtml(tag)}</span>`).join('');
        }
        if (imageEl && post.featuredImage) {
            imageEl.src = post.featuredImage;
            imageEl.alt = '';
            imageEl.hidden = false;
        }

        const markdown = post.content || post.excerpt || '';
        if (bodyEl) {
            bodyEl.innerHTML = typeof marked !== 'undefined'
                ? marked.parse(markdown)
                : simpleMarkdown(markdown);
        }
    } catch (error) {
        console.error('Error loading post:', error);
        showError('Could not load the post. Please try again later.');
    }
}

function showError(message) {
    const bodyEl = document.getElementById('postBody');
    const titleEl = document.getElementById('postTitle');
    if (titleEl) titleEl.textContent = 'Post unavailable';
    if (bodyEl) {
        bodyEl.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">POST</div>
                <h3>${escapeHtml(message)}</h3>
                <p><a href="blog.html">Back to the blog</a></p>
            </div>
        `;
    }
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function simpleMarkdown(text) {
    return escapeHtml(text)
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/^(.+)$/gm, '<p>$1</p>');
}

function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value == null ? '' : String(value);
    return div.innerHTML;
}
