import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { test } from 'node:test';

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
  assert.equal(home.match(/class="project-card"/g)?.length, projects.length);
  assert.equal(home.match(/<button\b[^>]*data-skill-bubble\b/g)?.length, skills.length);
  for (const project of projects) assert.ok(home.includes(`data-keywords="${project.keywords.map((keyword) => keyword.toLowerCase()).join('|')}"`));
  for (const skill of skills) {
    const hasProject = projects.some((project) => project.keywords.some((keyword) => keyword.toLowerCase() === skill.name.toLowerCase()));
    assert.ok(home.includes(`data-skill="${skill.name.toLowerCase()}" data-has-project="${hasProject}"`));
  }
  assert.ok(!existsSync(join(dist, 'projets/index.html')));
  for (const skill of ['python', 'django', 'rust']) assert.match(home, new RegExp(`data-skill="${skill}" data-has-project="true"`));
  assert.match(home, /data-keywords="rust\|cli\|tools"/);
  assert.match(home, /Je mène mes missions via ma société/);
  assert.match(home, /Applications,/);
  assert.match(home, /mailto:contact@rayan.world/);
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
