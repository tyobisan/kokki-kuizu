const CACHE = 'kuni-flag-v1';

const FLAG_IMGS = [
  'JPL.GIF','KRL.GIF','CNL.GIF','INL.GIF','THL.GIF','IDL.GIF','VNL.GIF',
  'MYL.GIF','SGL.GIF','PHL.GIF','MML.GIF','KHL.GIF','MNL.GIF','PKL.GIF',
  'BDL.GIF','NPL.GIF','SAL.GIF','ILL.GIF','IRL.GIF','IQL.GIF',
  'GBL.GIF','FRL.GIF','DEL.GIF','ITL.GIF','ESL.GIF','RUL.GIF','PTL.GIF',
  'NLL.GIF','SEL.GIF','NOL.GIF','DKL.GIF','FIL.GIF','CHL.GIF','ATL.GIF',
  'PLL.GIF','GRL.GIF','UAL.GIF','CZL.GIF','HUL.GIF','ROL.GIF',
  'USL.GIF','CAL.GIF','MXL.GIF','BRL.GIF','ARL.GIF','CLL.GIF','PEL.GIF',
  'CUL.GIF','COL.GIF','JML.GIF',
  'EGL.GIF','ZAL.GIF','NGL.GIF','KEL.GIF','ETL.GIF','GHL.GIF','TZL.GIF','MAL.GIF',
  'AUL.GIF','NZL.GIF','FJL.GIF','TOL.GIF',
];

const IMG_BASE = 'https://www.asahi-net.or.jp/~yq3t-hruc/img/';
const IMG_URLS = FLAG_IMGS.map(f => IMG_BASE + f);

const STATIC = [
  './',
  './index.html',
  'https://fonts.googleapis.com/css2?family=Kaisei+Decol:wght@400;700&family=Noto+Sans+JP:wght@400;700;900&display=swap',
];

// インストール時：静的ファイルと全国旗画像をキャッシュ
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(async cache => {
      // 静的ファイル
      await cache.addAll(STATIC).catch(() => {});
      // 国旗画像：1枚ずつ失敗しても続ける
      for (const url of IMG_URLS) {
        await cache.add(url).catch(() => {});
      }
    })
  );
  self.skipWaiting();
});

// 古いキャッシュを削除
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// リクエスト：キャッシュ優先、なければネット
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
