const CACHE_NAME = 'power-system-lab-v2.1.0';

// 基础核心离线外壳文件
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon.svg'
];

// 安装阶段：强制立即接管，不等待旧 SW 退出
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// 激活阶段：立即清除所有旧版本缓存，并通知所有打开的页面生效
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] 清理旧版本缓存:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 请求拦截策略：
// 1. 本地开发环境 (localhost / 127.0.0.1)：完全放行网络，避免干扰本地热更新
// 2. 主页面导航请求：强制【网络优先 (Network-First)】，保证刷新就能立即看到最新代码
// 3. 静态资源：网络优先，网络断开时回退离线缓存
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // 本地开发环境不拦截，确保热更新实时生效
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    return;
  }

  // 导航或 HTML 请求：网络优先 (Network-First)
  const isNavigate = request.mode === 'navigate' || 
    (request.headers.get('accept') && request.headers.get('accept').includes('text/html'));

  if (isNavigate) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || caches.match('./index.html') || caches.match('./');
          });
        })
    );
    return;
  }

  // 其他资源：网络优先，离线回退缓存
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return networkResponse;
      })
      .catch(() => caches.match(request))
  );
});
