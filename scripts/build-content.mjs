import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const blogDir = path.join(root, 'content', 'blog');
const resourcesDir = path.join(root, 'content', 'resources', 'items');

async function readMarkdownEntries(dir) {
  let files = [];
  try {
    files = await fs.readdir(dir);
  } catch {
    return [];
  }

  const entries = [];
  for (const file of files.filter((name) => name.endsWith('.md'))) {
    const fullPath = path.join(dir, file);
    const raw = await fs.readFile(fullPath, 'utf8');
    const { data, body } = parseFrontmatter(raw);
    const slug = data.slug || file.replace(/\.md$/, '');

    entries.push({
      ...data,
      slug,
      content: body.replace(/\r\n/g, '\n').trim(),
    });
  }

  return entries.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
}

function parseFrontmatter(raw) {
  if (!raw.startsWith('---')) {
    return { data: {}, body: raw };
  }

  const end = raw.indexOf('\n---', 3);
  if (end === -1) {
    return { data: {}, body: raw };
  }

  const frontmatter = raw.slice(3, end).trim();
  const body = raw.slice(end + 4).trimStart();
  return { data: parseYamlSubset(frontmatter), body };
}

function parseYamlSubset(source) {
  const data = {};
  const lines = source.split(/\r?\n/);

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (rawValue === '') {
      const values = [];
      while (i + 1 < lines.length && /^\s+-\s+/.test(lines[i + 1])) {
        i += 1;
        values.push(coerceValue(lines[i].replace(/^\s+-\s+/, '')));
      }
      data[key] = values;
    } else {
      data[key] = coerceValue(rawValue);
    }
  }

  return data;
}

function coerceValue(value) {
  const trimmed = value.trim();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null') return null;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  return trimmed.replace(/^["']|["']$/g, '');
}

function postIndexEntry(post) {
  return {
    slug: post.slug,
    title: post.title || titleFromSlug(post.slug),
    date: post.date || '',
    tags: Array.isArray(post.tags) ? post.tags : [],
    excerpt: post.excerpt || '',
    featured: Boolean(post.featured),
    featuredImage: post.featuredImage || '',
    content: post.content || '',
  };
}

function resourceIndexEntry(resource) {
  return {
    slug: resource.slug,
    title: resource.title || titleFromSlug(resource.slug),
    description: resource.description || '',
    date: resource.date || '',
    category: resource.category || 'Other',
    type: resource.type || 'Article',
    file: resource.file || '',
    externalUrl: resource.externalUrl || '',
    featured: Boolean(resource.featured),
    notes: resource.content || '',
  };
}

function titleFromSlug(slug) {
  return String(slug || '')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

async function writeJson(file, data) {
  await fs.writeFile(file, `${JSON.stringify(data, null, 2)}\n`);
}

const byFeaturedThenDate = (a, b) => (
  Number(Boolean(b.featured)) - Number(Boolean(a.featured))
  || new Date(b.date || 0) - new Date(a.date || 0)
);

const posts = (await readMarkdownEntries(blogDir)).map(postIndexEntry).sort(byFeaturedThenDate);
const resources = (await readMarkdownEntries(resourcesDir)).map(resourceIndexEntry).sort(byFeaturedThenDate);

await writeJson(path.join(blogDir, 'posts.json'), { posts });
await writeJson(path.join(root, 'content', 'resources', 'resources.json'), { resources });

console.log(`Generated ${posts.length} posts and ${resources.length} resources.`);
