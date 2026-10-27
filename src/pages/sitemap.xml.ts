import type { APIRoute } from 'astro';
import { posts, categories, slug, postUrl } from '../lib/content.js';

export const GET: APIRoute = async ({ site }) => {
  const allPosts = await posts();
  const paths = ['/', '/blog/', '/blog/categories/', ...allPosts.map(postUrl), ...categories(allPosts).map(([tag]) => `/blog/categories/${slug(tag)}/`)];
  const urls = paths.map((path) => `<url><loc>${new URL(path, site).href}</loc></url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
