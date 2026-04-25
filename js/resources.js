/**
 * Resources listing rendered from the CMS-generated resources index.
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
        if (!response.ok) throw new Error('Missing resources index');
        const rawData = await response.json();
        const resources = normalizeResources(rawData);

        if (resources.length === 0) {
            showEmpty(grid, emptyState);
            return;
        }

        renderFilters(resources, filtersContainer, grid);
        renderResources(resources, grid, 'all');
    } catch (error) {
        console.warn('No resources found yet.', error);
        showEmpty(grid, emptyState);
    }
}

function normalizeResources(rawData) {
    const resources = Array.isArray(rawData) ? rawData : (rawData?.resources || []);
    return resources
        .filter((resource) => resource && resource.title)
        .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || new Date(b.date || 0) - new Date(a.date || 0));
}

function renderFilters(resources, filtersContainer, grid) {
    if (!filtersContainer) return;
    const allCategories = new Set();
    resources.forEach((resource) => {
        if (resource.category) allCategories.add(resource.category);
    });

    allCategories.forEach((category) => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.dataset.filter = category;
        btn.textContent = category;
        filtersContainer.appendChild(btn);
    });

    filtersContainer.querySelectorAll('.filter-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            filtersContainer.querySelectorAll('.filter-btn').forEach((item) => item.classList.remove('active'));
            btn.classList.add('active');
            renderResources(resources, grid, btn.dataset.filter);
        });
    });
}

function renderResources(resources, grid, filter) {
    const filtered = filter === 'all'
        ? resources
        : resources.filter((resource) => resource.category === filter);

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-state-icon">DOC</div>
                <h3>No resources found</h3>
                <p>No resources match the selected category.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(renderResourceCard).join('');
}

function renderResourceCard(resource) {
    const href = resource.externalUrl || resource.file;
    const action = href
        ? `<a href="${escapeAttribute(href)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">Open</a>`
        : `<span class="btn btn-secondary btn-sm disabled">Coming soon</span>`;

    return `
        <article class="resource-card">
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
