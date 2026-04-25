/**
 * Resources Listing JavaScript
 * Fetches resources.json and renders resource cards with category filtering
 */

document.addEventListener('DOMContentLoaded', () => {
    loadResources();
});

async function loadResources() {
    const grid = document.getElementById('resourcesGrid');
    const emptyState = document.getElementById('resourcesEmpty');
    const filtersContainer = document.getElementById('resourceFilters');

    if (!grid) return;

    try {
        const response = await fetch('content/resources/resources.json');
        const rawData = await response.json();
        const resources = Array.isArray(rawData) ? rawData : (rawData?.resources || []);

        if (!resources || resources.length === 0) {
            grid.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        // Sort by date (newest first)
        resources.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Extract unique categories
        const allCategories = new Set();
        resources.forEach(res => {
            if (res.category) allCategories.add(res.category);
        });

        // Build filter buttons
        if (filtersContainer && allCategories.size > 0) {
            allCategories.forEach(cat => {
                const btn = document.createElement('button');
                btn.className = 'filter-btn';
                btn.dataset.filter = cat;
                btn.textContent = cat;
                filtersContainer.appendChild(btn);
            });

            // Attach filter events
            filtersContainer.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    filtersContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    renderResources(resources, grid, btn.dataset.filter);
                });
            });
        }

        // Initial render
        renderResources(resources, grid, 'all');

    } catch (error) {
        console.log('No resources found yet. Add resources via the CMS or by editing content/resources/resources.json');
        grid.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
    }
}

function renderResources(resources, grid, filter) {
    const filtered = filter === 'all'
        ? resources
        : resources.filter(r => r.category === filter);

    if (filtered.length === 0) {
        grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">🔍</div>
        <h3>No resources found</h3>
        <p>No resources match the selected category.</p>
      </div>
    `;
        return;
    }

    grid.innerHTML = filtered.map(resource => {
        const icon = getFileIcon(resource.type);
        return `
      <div class="resource-card">
        <div class="resource-icon">${icon}</div>
        <h3 class="resource-card-title">${escapeHtml(resource.title)}</h3>
        <p class="resource-card-description">${escapeHtml(resource.description)}</p>
        <div class="resource-card-meta">
          <span class="resource-card-date">${formatDate(resource.date)}</span>
          <span class="resource-card-type">${resource.type || 'Document'}</span>
        </div>
        <div class="resource-card-actions">
          ${resource.file ? `
            <a href="${resource.file}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
              📥 Download
            </a>
            <a href="${resource.file}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
              👁️ View
            </a>
          ` : `
            <span class="btn btn-secondary btn-sm" style="opacity: 0.5; cursor: default;">
              📄 Coming Soon
            </span>
          `}
        </div>
      </div>
    `;
    }).join('');
}

function getFileIcon(type) {
    const icons = {
        'PDF': '📕',
        'Word': '📘',
        'Notes': '📝',
        'Slides': '📊',
        'Code': '💻',
        'Video': '🎬',
        'Article': '📰'
    };
    return icons[type] || '📄';
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
