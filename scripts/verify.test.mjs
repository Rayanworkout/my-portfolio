import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const root = new URL('../', import.meta.url).pathname;
const dist = join(root, 'dist');
const pages = walk(dist).filter((file) => file.endsWith('.html'));

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const file = join(dir, name);
    return statSync(file).isDirectory() ? walk(file) : [file];
  });
}

test('all migrated content is built on the one domain', () => {
  const sourcePosts = readdirSync(join(root, 'src/content/blog')).filter((name) => name.endsWith('.md'));
  const builtPosts = pages.filter((file) => /\/blog\/\d{4}\/\d{2}\/\d{2}\/[^/]+\/index\.html$/.test(file));
  assert.equal(sourcePosts.length, builtPosts.length);
  assert.ok(builtPosts.length >= 20);
  assert.ok(existsSync(join(dist, 'blog/categories/index.html')));
  const projects = JSON.parse(readFileSync(join(root, 'src/data/projects.json')));
  const skills = JSON.parse(readFileSync(join(root, 'src/data/skills.json')));
  const home = readFileSync(join(dist, 'index.html'), 'utf8');
  const projectPage = readFileSync(join(dist, 'projets/index.html'), 'utf8');
  assert.equal(home.match(/class="project-card"/g)?.length, 3);
  assert.equal(projectPage.match(/class="project-card"/g)?.length, projects.length);
  for (const name of ['Python Runner', 'Find &amp; Replace', 'Indexium']) assert.ok(home.includes(`<h3>${name}</h3>`));
  assert.equal(projectPage.match(/class="project-card-image"/g)?.length, projects.length);
  assert.equal(home.match(/class="writing-card"/g)?.length, 3);
  const projectSkills = skills.filter((skill) => projects.some((project) => project.keywords.some((keyword) => keyword.toLowerCase() === skill.name.toLowerCase())));
  assert.equal(projectPage.match(/<button\b[^>]*data-skill-bubble\b/g)?.length, projectSkills.length);
  for (const project of projects) assert.ok(projectPage.includes(`data-keywords="${project.keywords.map((keyword) => keyword.toLowerCase()).join('|')}"`));
  for (const skill of skills) {
    assert.equal(projectPage.includes(`data-skill="${skill.name.toLowerCase()}"`), projectSkills.includes(skill));
    assert.ok(home.includes(`<strong>${skill.name}</strong>`));
  }
  for (const skill of ['python', 'django', 'rust']) assert.match(projectPage, new RegExp(`data-skill="${skill}"`));
  assert.match(projectPage, /data-keywords="rust\|cli\|tools"/);
  assert.match(home, /Applications, données, déploiement./);
  assert.match(home, /Voir tous mes projets/);
  assert.match(home, /Voir tous les articles/);
  assert.match(home, /href="\/#competences"/);
  assert.match(readFileSync(join(dist, 'blog/2026/01/16/automatically-start-program-at-startup-on-windows/index.html'), 'utf8'), /<html lang="fr">/);
  assert.match(readFileSync(join(dist, 'blog/2026/01/16/create-an-anacron/index.html'), 'utf8'), /<html lang="en">/);
  assert.match(home, /mailto:contact@rayan.world/);
  const blog = readFileSync(join(dist, 'blog/index.html'), 'utf8');
  assert.equal(blog.match(/<button\b[^>]*data-blog-filter/g)?.length, 9);
  assert.equal(blog.match(/class="post-row" data-tags/g)?.length, sourcePosts.length);
  assert.equal((blog.match(/data-tags="[^"]*networking[^"]*"/g) || []).length, 12);
  assert.ok(!pages.some((file) => /Marseille|Enoé Énergies|Profil personnel|rayan13170@protonmail\.com/.test(readFileSync(file, 'utf8'))));
  assert.ok(pages.every((file) => [...readFileSync(file, 'utf8').matchAll(/<a\b[^>]*href="https:\/\/flowshift\.rayan\.world\/"[^>]*>/g)].every(([link]) => /target="_blank"/.test(link) && /rel="noopener noreferrer"/.test(link))));
  assert.ok(!pages.some((file) => readFileSync(file, 'utf8').includes('blog.rayan.world')));
});

test('generated pages have working local links, anchors and image dimensions', () => {
  for (const page of pages) {
    const html = readFileSync(page, 'utf8');
    const route = '/' + relative(dist, page).replace(/index\.html$/, '');
    assert.equal(html.match(/<h1(?:\s|>)/g)?.length, 1, `${route}: expected one h1`);
    const headings = [...html.matchAll(/<h([1-6])(?:\s|>)/g)].map((match) => Number(match[1]));
    for (let i = 1; i < headings.length; i++) assert.ok(headings[i] <= headings[i - 1] + 1, `${route}: heading level skipped`);
    if (!page.endsWith('/404.html')) assert.match(html, /rel="canonical"/);
    for (const image of html.matchAll(/<img\b[^>]*>/g)) {
      assert.match(image[0], /\bwidth="\d+"/);
      assert.match(image[0], /\bheight="\d+"/);
      assert.match(image[0], /\balt(?:="[^"]*")?(?:\s|>)/);
    }
    for (const [, value] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const url = new URL(value.replaceAll('&amp;', '&'), `https://rayan.world${route}`);
      if (url.host !== 'rayan.world') continue;
      const path = decodeURIComponent(url.pathname);
      const target = join(dist, path, path.endsWith('/') ? 'index.html' : '');
      assert.ok(existsSync(target), `${route}: broken link ${value}`);
      if (url.hash) assert.ok(readFileSync(target, 'utf8').includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `${route}: missing anchor ${value}`);
    }
  }
});

test('technical articles keep code rendering and the sitemap covers all routes', () => {
  assert.match(readFileSync(join(dist, 'blog/2026/01/16/basic-service/index.html'), 'utf8'), /class="astro-code/);
  const sitemap = readFileSync(join(dist, 'sitemap.xml'), 'utf8');
  assert.equal((sitemap.match(/<loc>/g) || []).length, pages.length - 1);
  assert.ok(!pages.some((page) => readFileSync(page, 'utf8').includes('[[')));
});

test('blog and project filters update the visible results', () => {
  const blog = readFileSync(join(dist, 'blog/index.html'), 'utf8');
  const script = blog.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
  const rows = [...blog.matchAll(/<article class="post-row" data-tags(?:="([^"]*)")?/g)].map(([, tags = '']) => ({ dataset: { tags }, hidden: false }));
  const all = { dataset: {}, addEventListener(_, handler) { this.click = handler; }, setAttribute() {} };
  const networking = { dataset: { tag: 'networking', label: 'networking' }, addEventListener(_, handler) { this.click = handler; }, setAttribute() {} };
  const heading = { textContent: '' };
  const count = { textContent: '' };
  runInNewContext(script, { document: {
    querySelectorAll: (selector) => selector === '[data-blog-filter]' ? [all, networking] : rows,
    querySelector: (selector) => selector === '#all-posts-title' ? heading : count,
  } });
  networking.click();
  assert.equal(rows.filter((row) => !row.hidden).length, 12);
  assert.equal(count.textContent, '12 notes');
  all.click();
  assert.equal(rows.filter((row) => !row.hidden).length, rows.length);

  const projectPage = readFileSync(join(dist, 'projets/index.html'), 'utf8');
  const projectScript = projectPage.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
  const projectRows = [...projectPage.matchAll(/class="project-item" data-keywords="([^"]+)"/g)].map(([, keywords]) => ({ dataset: { keywords }, toggleAttribute(name, value) { this[name] = value; } }));
  const bubble = { dataset: { skill: 'rust' }, textContent: 'Rust', pressed: 'false', addEventListener(_, handler) { this.click = handler; }, getAttribute() { return this.pressed; }, setAttribute(_, value) { this.pressed = value; } };
  const grid = { toggleAttribute(_, value) { this.filtering = value; } };
  const selection = { hidden: true, querySelector: () => ({ textContent: '' }) };
  const clear = { addEventListener(_, handler) { this.click = handler; } };
  runInNewContext(projectScript, { document: {
    querySelectorAll: (selector) => selector === '[data-skill-bubble]' ? [bubble] : projectRows,
    querySelector: (selector) => ({ '.projects-grid': grid, '#project-selection': selection, '#clear-project-selection': clear })[selector],
  } });
  bubble.click();
  assert.equal(projectRows.filter((row) => row['data-match']).length, 1);
  assert.equal(bubble.pressed, 'true');
  clear.click();
  assert.equal(grid.filtering, false);
});

test('navbar contact copies its visible address and reports failure', async () => {
  const home = readFileSync(join(dist, 'index.html'), 'utf8');
  assert.match(home, /<button[^>]*data-copy-email[^>]*>contact@rayan\.world<\/button>/);
  assert.doesNotMatch(home, /class="nav-contact" href="mailto:/);
  const script = home.match(/<script type="module">([\s\S]*?data-copy-email[\s\S]*?)<\/script>/)[1];
  const status = { textContent: '' };
  const button = { textContent: 'contact@rayan.world', dataset: {}, addEventListener(_, handler) { this.click = handler; } };
  let copied;
  const context = {
    document: { querySelector: (selector) => selector === '[data-copy-email]' ? button : status },
    navigator: { clipboard: { writeText: async (value) => { copied = value; } } },
    clearTimeout() {}, setTimeout() { return 1; },
  };
  runInNewContext(script, context);
  await button.click();
  assert.equal(copied, 'contact@rayan.world');
  assert.equal(button.dataset.copyState, 'copied');
  assert.equal(status.textContent, 'Adresse copiée.');
  context.navigator.clipboard.writeText = async () => { throw new Error('denied'); };
  await button.click();
  assert.equal(button.dataset.copyState, 'failed');
  assert.match(status.textContent, /Copie impossible/);
});
