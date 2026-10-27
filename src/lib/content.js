import { getCollection } from 'astro:content';

export const slug = (value) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const label = (tag) => tag.replaceAll('_', ' ');
export const postUrl = (post) => `/blog/${post.id.slice(0, 4)}/${post.id.slice(5, 7)}/${post.id.slice(8, 10)}/${post.id.slice(11)}/`;
export const postDate = (post) => post.id.slice(0, 10);
export const dateLabel = (post) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${postDate(post)}T00:00:00Z`));
export const posts = async () => (await getCollection('blog')).sort((a, b) => b.id.localeCompare(a.id));
export const categories = (allPosts) => {
  const counts = new Map();
  for (const post of allPosts) for (const tag of post.data.tags.length ? post.data.tags : ['Sans catégorie']) counts.set(tag, (counts.get(tag) || 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
};
export const excerpt = (post) => {
  let code = false;
  for (const line of (post.body || '').split('\n')) {
    const text = line.trim();
    if (/^(```|~~~)/.test(text)) { code = !code; continue; }
    if (code || text.length < 45 || /^(#|- |\* |> |\|)/.test(text)) continue;
    const plain = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[`*_]/g, '');
    if (plain.length >= 45) return plain.slice(0, 180);
  }
  return `Note technique : ${post.data.title}.`;
};
