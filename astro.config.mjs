import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://rayan.world',
  output: 'static',
  markdown: {
    shikiConfig: { theme: 'github-light' },
  },
});
