/**
 * Blog Post Viewer JavaScript
 * Reads slug from URL, fetches markdown, renders with marked.js
 */

document.addEventListener('DOMContentLoaded', () => {
    loadPost();
});

async function loadPost() {
    const titleEl = document.getElementById('postTitle');
    const dateEl = document.getElementById('postDate');
    const tagsEl = document.getElementById('postTags');
    const bodyEl = document.getElementById('postBody');

    // Get slug from URL
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');

    if (!slug) {
        showError('No post specified.');
        return;
    }

    try {
        // First, get post metadata from posts.json
        const metaResponse = await fetch('content/blog/posts.json');
        const rawData = await metaResponse.json();
        const posts = Array.isArray(rawData) ? rawData : (rawData?.posts || []);
        const postMeta = posts.find(p => p.slug === slug);

        if (!postMeta) {
            showError('Post not found.');
            return;
        }

        // Update page title
        document.title = `${postMeta.title} — Satish Patibandla`;

        // Set metadata
        if (titleEl) titleEl.textContent = postMeta.title;
        if (dateEl) dateEl.textContent = formatDate(postMeta.date);

        // Render tags
        if (tagsEl && postMeta.tags) {
            tagsEl.innerHTML = postMeta.tags.map(tag =>
                `<span class="blog-card-tag">${tag}</span>`
            ).join('');
        }

        // Fetch and render markdown content
        const mdResponse = await fetch(`content/blog/${slug}.md`);
        if (!mdResponse.ok) {
            // If no markdown file, use the excerpt as content
            if (bodyEl) bodyEl.innerHTML = `<p>${postMeta.excerpt}</p><p>${postMeta.content || ''}</p>`;
            return;
        }

        const markdown = await mdResponse.text();

        // Configure marked
        if (typeof marked !== 'undefined') {
            marked.setOptions({
                breaks: true,
                gfm: true
            });
            if (bodyEl) bodyEl.innerHTML = marked.parse(markdown);
        } else {
            // Fallback: simple markdown rendering
            if (bodyEl) bodyEl.innerHTML = simpleMarkdown(markdown);
        }

    } catch (error) {
        console.error('Error loading post:', error);
        showError('Could not load the post. Please try again later.');
    }
}

function showError(message) {
    const bodyEl = document.getElementById('postBody');
    const titleEl = document.getElementById('postTitle');
    if (titleEl) titleEl.textContent = 'Oops!';
    if (bodyEl) {
        bodyEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">😕</div>
        <h3>${message}</h3>
        <p><a href="blog.html">← Go back to the blog</a></p>
      </div>
    `;
    }
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Simple fallback markdown renderer
function simpleMarkdown(text) {
    return text
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/^(.+)$/gm, '<p>$1</p>');
}
