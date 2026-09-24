import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // 确保在 GitHub Pages 任意仓库子路径下均可直接加载静态资源
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});
