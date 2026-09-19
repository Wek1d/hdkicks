(function () {
'use strict';

/* ---------- Inline utilities ---------- */
function createLimiter(max) {
  let active = 0;
  const queue = [];
  const next = () => {
    if (active >= max || !queue.length) return;
    active++;
    const { fn, resolve, reject } = queue.shift();
    Promise.resolve().then(fn).then(resolve, reject)
      .finally(() => { active--; next(); });
  };
  return function limit(fn) {
    return new Promise((resolve, reject) => {
      queue.push({ fn, resolve, reject });
      next();
    });
  };
}
async function retry(fn, { retries = 2, minTimeout = 600, factor = 2 } = {}) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try { return await fn(i); }
    catch (e) {
      lastErr = e;
      if (i === retries) break;
      await new Promise(r => setTimeout(r, minTimeout * Math.pow(factor, i)));
    }
  }
  throw lastErr;
}
const onIdle = window.requestIdleCallback
  ? (fn) => window.requestIdleCallback(fn, { timeout: 1500 })
  : (fn) => setTimeout(fn, 200);

/* ---------- i18n ---------- */
const dict = {
  tr: {
    docTitle: 'hdkicks — Kick profil görseli',
    kicker: 'Kick · Görsel Aracı',
    title: 'Kick profil görselini en <span class="hl">yüksek çözünürlükle</span> çek.',
    lede: "Kullanıcı adı ya da link yeter. Kick'in genel API'sinden alır, ölçeklemez, sadeleştirmez. İstersen PNG/JPEG/WebP'ye dönüştür.",
    goBtn: 'Çek',
    queryPlaceholder: 'kullaniciadi',
    hintPre: 'Tam link de yapıştırabilirsin — ',
    hintMono: 'https://kick.com/…',
    hintPost: ' otomatik ayıklanır.',
    loading: 'profil aranıyor…',
    retrying: 'tekrar deneniyor…',
    notFoundTitle: 'Kullanıcı bulunamadı',
    notFoundDetail: (u) => `@${u} adında bir Kick kanalı bulamadım.`,
    noPicTitle: 'Profil görseli yok',
    noPicDetail: (u) => `@${u} bir Kick hesabı ama profil fotoğrafı ayarlamamış.`,
    connTitle: 'Bağlantı hatası',
    connDetail: 'Kick sunucusuna ulaşılamadı, birkaç saniye sonra tekrar dene.',
    rateLimitTitle: 'Çok fazla istek',
    rateLimitDetail: 'Kick kısa süreliğine istek sınırı koydu. Birkaç saniye sonra tekrar dene.',
    serverTitle: 'Kick sunucusu yanıt vermiyor',
    serverDetail: 'Kick tarafında geçici bir sorun olabilir, birazdan tekrar dene.',
    retryBtn: 'Yeniden dene',
    preparing: 'hazırlanıyor…',
    downloadBtn: 'İndir',
    openBtn: 'Tam boy',
    copyImgBtn: 'Görseli kopyala',
    copyLinkBtn: 'Linki kopyala',
    shareBtn: 'Paylaş',
    qrTitle: 'Bu sonucu paylaş',
    tabAvatar: 'Avatar',
    tabBanner: 'Banner',
    zoomTag: 'büyüt',
    zoomHint: 'tıkla / çift tıkla: yakınlaştır',
    closeAria: 'Kapat',
    themeAria: 'Temayı değiştir',
    footerNote: "Kick'in genel kanal API'sini kullanır, bağlantılı değildir.",
    footerBy: 'by Wek1d',
    original: 'orijinal',
    qualityHighest: '✓ en yüksek',
    qualitySource: 'kaynak',
    historyLabel: 'son aramalar',
    historyClear: 'temizle',
    toastCopied: 'Görsel panoya kopyalandı',
    toastLinkCopied: 'Site linki kopyalandı',
    toastCopyFailed: 'Kopyalanamadı',
    toastDownloaded: 'İndirildi',
    toastDownloadFailed: 'İndirme başarısız',
    toastConvertFailed: 'Dönüştürme başarısız',
    toastNoShare: 'Cihaz paylaşımı desteklemiyor',
    toastQrCopied: 'URL kopyalandı',
    formatOriginal: 'Orijinal',
    shareTitle: (u) => `@${u} · hdkicks`,
    shareText: (u) => `Kick profil görseli: @${u} — hdkicks ile indir`,
  },
  en: {
    docTitle: 'hdkicks — Kick profile picture',
    kicker: 'Kick · Image Tool',
    title: 'Grab a Kick profile picture in its <span class="hl">highest resolution</span>.',
    lede: "Just a username or a link. Pulled straight from Kick's public API — no resizing, no compression. Convert to PNG/JPEG/WebP if you want.",
    goBtn: 'Fetch',
    queryPlaceholder: 'username',
    hintPre: 'You can paste the full link too — ',
    hintMono: 'https://kick.com/…',
    hintPost: ' gets parsed automatically.',
    loading: 'looking up profile…',
    retrying: 'retrying…',
    notFoundTitle: 'User not found',
    notFoundDetail: (u) => `Couldn't find a Kick channel named @${u}.`,
    noPicTitle: 'No profile picture',
    noPicDetail: (u) => `@${u} is a Kick account, but hasn't set a profile picture.`,
    connTitle: 'Connection error',
    connDetail: "Couldn't reach Kick's servers — try again in a few seconds.",
    rateLimitTitle: 'Too many requests',
    rateLimitDetail: 'Kick is rate-limiting right now. Try again in a few seconds.',
    serverTitle: "Kick's server is not responding",
    serverDetail: "There may be a temporary issue on Kick's side — try again shortly.",
    retryBtn: 'Retry',
    preparing: 'preparing…',
    downloadBtn: 'Download',
    openBtn: 'Full size',
    copyImgBtn: 'Copy image',
    copyLinkBtn: 'Copy link',
    shareBtn: 'Share',
    qrTitle: 'Share this result',
    tabAvatar: 'Avatar',
    tabBanner: 'Banner',
    zoomTag: 'zoom',
    zoomHint: 'click / double-click to zoom',
    closeAria: 'Close',
    themeAria: 'Toggle theme',
    footerNote: "Uses Kick's public channel API — not affiliated with Kick.",
    footerBy: 'by Wek1d',
    original: 'original',
    qualityHighest: '✓ highest',
    qualitySource: 'source',
    historyLabel: 'recent',
    historyClear: 'clear',
    toastCopied: 'Image copied to clipboard',
    toastLinkCopied: 'Site link copied',
    toastCopyFailed: 'Copy failed',
    toastDownloaded: 'Downloaded',
    toastDownloadFailed: 'Download failed',
    toastConvertFailed: 'Conversion failed',
    toastNoShare: 'Sharing not supported on this device',
    toastQrCopied: 'URL copied',
    formatOriginal: 'Original',
    shareTitle: (u) => `@${u} · hdkicks`,
    shareText: (u) => `Kick profile picture: @${u} — grab it with hdkicks`,
  },
};

/* ---------- State ---------- */
const $ = (id) => document.getElementById(id);
const LANG_KEY = 'hdkicks-lang';
function getStoredLang() {
  try {
    const v = localStorage.getItem(LANG_KEY);
    return (v === 'tr' || v === 'en') ? v : null;
  } catch { return null; }
}
function storeLang(value) {
  try { localStorage.setItem(LANG_KEY, value); } catch {}
}
let lang = getStoredLang() || ((navigator.language || 'en').toLowerCase().startsWith('tr') ? 'tr' : 'en');
let lastErrorState = null;
let currentFormat = 'original';
const state = {
  username: '',
  activeTab: 'avatar',
  assets: { avatar: null, banner: null },
};

function t() { return dict[lang]; }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function makeErr(type) { const e = new Error(type); e.type = type; return e; }

/* ---------- DOM refs ---------- */
const form = $('pfp-form');
const queryInput = $('query');
const goBtn = $('go-btn');
const stage = $('stage');
const states = { loading: $('state-loading'), error: $('state-error'), result: $('state-result') };
const previewFrame = $('preview-frame');
const previewImg = $('preview-img');
const resultUsername = $('result-username');
const resultSpecs = $('result-specs');
const downloadBtn = $('download-btn');
const formatTrigger = $('format-trigger');
const formatMenu = $('format-menu');
const formatCurrent = $('format-current');
const openBtn = $('open-btn');
const copyImgBtn = $('copy-img-btn');
const copyLinkBtn = $('copy-link-btn');
const shareBtn = $('share-btn');
const qrBtn = $('qr-btn');
const errorTitle = $('error-title');
const errorDetail = $('error-detail');
const retryBtn = $('retry-btn');
const loadingText = $('loading-text');
const historyWrap = $('history');
const historyList = $('history-list');
const historyLabel = $('history-label');
const historyClear = $('history-clear');
const resultTabs = $('result-tabs');
const tabAvatar = $('tab-avatar');
const tabBanner = $('tab-banner');
const toastRoot = $('toast-root');
const qrModal = $('qr-modal');
const qrImg = $('qr-img');
const qrUrl = $('qr-url');
const qrTitle = $('qr-title');
const isMobile = window.matchMedia('(max-width: 640px)').matches;

/* ---------- Format dropdown ---------- */
const FORMAT_KEY = 'hdkicks:format';
const FORMAT_LABELS = { original: 'Orijinal', png: 'PNG', jpeg: 'JPG', webp: 'WEBP' };
function updateFormatUI() {
  const d = t();
  const label = currentFormat === 'original'
    ? (d.formatOriginal || FORMAT_LABELS.original)
    : FORMAT_LABELS[currentFormat];
  formatCurrent.textContent = label;
  formatMenu.querySelectorAll('li').forEach(li => {
    li.classList.toggle('selected', li.dataset.value === currentFormat);
  });
}
try {
  const saved = localStorage.getItem(FORMAT_KEY);
  if (saved && FORMAT_LABELS[saved]) currentFormat = saved;
} catch {}

function openFormatMenu() {
  formatMenu.classList.add('open');
  formatTrigger.setAttribute('aria-expanded', 'true');
}
function closeFormatMenu() {
  formatMenu.classList.remove('open');
  formatTrigger.setAttribute('aria-expanded', 'false');
}
formatTrigger.addEventListener('click', (e) => {
  e.stopPropagation();
  if (formatMenu.classList.contains('open')) closeFormatMenu();
  else openFormatMenu();
});
formatMenu.querySelectorAll('li').forEach(li => {
  li.addEventListener('click', () => {
    currentFormat = li.dataset.value;
    try { localStorage.setItem(FORMAT_KEY, currentFormat); } catch {}
    updateFormatUI();
    closeFormatMenu();
  });
});
document.addEventListener('click', (e) => {
  if (!formatMenu.classList.contains('open')) return;
  if (!formatTrigger.contains(e.target) && !formatMenu.contains(e.target)) closeFormatMenu();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && formatMenu.classList.contains('open')) closeFormatMenu();
});

/* ---------- i18n apply ---------- */
function applyStaticText() {
  const d = t();
  document.title = d.docTitle;
  document.documentElement.lang = lang;
  $('kicker').textContent = d.kicker;
  $('title').innerHTML = d.title;
  $('lede').textContent = d.lede;
  goBtn.textContent = d.goBtn;
  $('query').placeholder = d.queryPlaceholder;
  $('hint').innerHTML = `${d.hintPre}<mono>${d.hintMono}</mono>${d.hintPost}`;
  loadingText.textContent = d.loading;
  openBtn.textContent = d.openBtn;
  copyImgBtn.textContent = d.copyImgBtn;
  copyLinkBtn.textContent = d.copyLinkBtn;
  shareBtn.textContent = d.shareBtn;
  $('zoom-tag').textContent = d.zoomTag;
  $('footer-note').textContent = d.footerNote;
  $('footer-by').textContent = d.footerBy;
  $('theme-toggle').setAttribute('aria-label', d.themeAria);
  retryBtn.textContent = d.retryBtn;
  tabAvatar.textContent = d.tabAvatar;
  tabBanner.textContent = d.tabBanner;
  historyLabel.textContent = d.historyLabel;
  historyClear.textContent = d.historyClear;
  qrTitle.textContent = d.qrTitle;
  if (!downloadBtn.dataset.busy) downloadBtn.textContent = d.downloadBtn;
  document.querySelectorAll('.lang-pill button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  updateFormatUI();
  if (lastErrorState) renderError(lastErrorState.type, lastErrorState.username);
  if (state.assets.avatar) renderSpecs();
}
function setLang(next) { lang = next; storeLang(next); applyStaticText(); }
document.querySelectorAll('.lang-pill button').forEach(btn => {
  btn.addEventListener('click', () => setLang(btn.dataset.lang));
});

/* ---------- Theme ----------
   Öncelik sırası: kullanıcının daha önce kaydettiği tercih (localStorage)
   > tarayıcı/sistem tercihi (prefers-color-scheme) > 'dark' varsayılanı.
   Kaydedilmiş bir tercih varsa sistem teması değişse bile onu ezmiyoruz. */
const THEME_KEY = 'hdkicks-theme';
const themeMedia = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;

function getStoredTheme() {
  try { return localStorage.getItem(THEME_KEY); } catch { return null; }
}
function storeTheme(value) {
  try { localStorage.setItem(THEME_KEY, value); } catch {}
}

let themeOverridden = !!getStoredTheme();
let theme = getStoredTheme() || (themeMedia && themeMedia.matches ? 'light' : 'dark');
document.documentElement.setAttribute('data-theme', theme);

$('theme-toggle').addEventListener('click', () => {
  themeOverridden = true;
  theme = theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  storeTheme(theme);
});
if (themeMedia) {
  const onSchemeChange = (e) => {
    if (themeOverridden) return;
    theme = e.matches ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  };
  if (themeMedia.addEventListener) themeMedia.addEventListener('change', onSchemeChange);
  else if (themeMedia.addListener) themeMedia.addListener(onSchemeChange);
}

/* ---------- Toast ---------- */
function toast(msg, kind) {
  const el = document.createElement('div');
  el.className = 'toast' + (kind === 'error' ? ' error' : '');
  el.textContent = msg;
  toastRoot.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    el.addEventListener('transitionend', () => el.remove(), { once: true });
  }, 2200);
}

/* ---------- History ---------- */
const HISTORY_KEY = 'hdkicks:history';
const HISTORY_MAX = 6;
function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); }
  catch { return []; }
}
function saveHistory(list) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(list)); } catch {}
}
function pushHistory(username) {
  if (!username) return;
  const list = loadHistory().filter(u => u.toLowerCase() !== username.toLowerCase());
  list.unshift(username);
  saveHistory(list.slice(0, HISTORY_MAX));
  renderHistory();
}
function renderHistory() {
  const list = loadHistory();
  if (!list.length) { historyWrap.hidden = true; return; }
  historyWrap.hidden = false;
  historyList.innerHTML = '';
  list.forEach(u => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'history-chip';
    b.textContent = '@' + u;
    b.addEventListener('click', () => { queryInput.value = u; run(u); });
    historyList.appendChild(b);
  });
}
historyClear.addEventListener('click', () => { saveHistory([]); renderHistory(); });

/* ---------- URL helpers ---------- */
/* Paylaşım linkleri artık #u=kullanıcı kullanıyor.
   Google hash fragment'ları ayrı sayfa saymaz → ?u= gibi
   duplicate content problemi çıkarmaz. */
function shareUrl(username) {
  const base = location.origin + location.pathname;
  if (!username) return base;
  return `${base}#u=${encodeURIComponent(username)}`;
}
/* Adres çubuğunu HİÇ değiştirmiyoruz → tek URL, tek sayfa,
   Google için temiz. Paylaşım linkleri shareUrl() ile üretiliyor. */
function updateUrl() { /* intentionally no-op */ }

/* ---------- Username extract ---------- */
function extractUsername(raw) {
  let v = (raw || '').trim();
  if (!v) return null;
  v = v.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/^kick\.com\//i, '');
  v = v.split('?')[0].split('#')[0];
  v = v.replace(/\/+$/, '');
  v = v.split('/')[0];
  return v || null;
}

/* ---------- Proxies ---------- */
const PROXY_CACHE_KEY = 'hdkicks:proxy';
const PROXIES = [
  { id: 'corsproxy',  build: (url) => `https://corsproxy.io/?url=${encodeURIComponent(url)}` },
  { id: 'allorigins', build: (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}` },
  { id: 'codetabs',   build: (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}` },
  { id: 'thingproxy', build: (url) => `https://thingproxy.freeboard.io/fetch/${url}` },
];
function getPreferredProxy() {
  try { return localStorage.getItem(PROXY_CACHE_KEY); } catch { return null; }
}
function setPreferredProxy(id) {
  try { localStorage.setItem(PROXY_CACHE_KEY, id); } catch {}
}
function orderedProxies() {
  const preferred = getPreferredProxy();
  if (!preferred) return PROXIES;
  return [...PROXIES].sort((a, b) => (a.id === preferred ? -1 : b.id === preferred ? 1 : 0));
}
async function fetchWithProxies(url, isJson) {
  let lastErr;
  for (const proxy of orderedProxies()) {
    try {
      const res = await fetch(proxy.build(url), { headers: isJson ? { Accept: 'application/json' } : {} });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      setPreferredProxy(proxy.id);
      return res;
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error('proxy failed');
}

/* ---------- Channel fetch ---------- */
async function fetchChannel(username) {
  const apiUrl = `https://kick.com/api/v2/channels/${encodeURIComponent(username)}`;
  try {
    const direct = await fetch(apiUrl, { headers: { Accept: 'application/json' } });
    if (direct.ok) return await direct.json();
    if (direct.status === 404) throw makeErr('notFound');
    if (direct.status === 429) throw makeErr('rateLimit');
    if (direct.status >= 500) throw makeErr('serverError');
  } catch (e) { if (e && e.type) throw e; }
  try {
    const res = await fetchWithProxies(apiUrl, true);
    if (res.status === 404) throw makeErr('notFound');
    if (res.status === 429) throw makeErr('rateLimit');
    if (res.status >= 500) throw makeErr('serverError');
    return await res.json();
  } catch (e) {
    if (e && e.type) throw e;
    throw makeErr('network');
  }
}

/* ---------- Variants ---------- */
function stripResizeParams(url) {
  try {
    const u = new URL(url);
    ['w','h','width','height','quality','q','resize','fit','crop','format','fm']
      .forEach(k => u.searchParams.delete(k));
    return u.toString().replace(/\?$/, '');
  } catch { return url.split('?')[0]; }
}
function generateVariants(url) {
  if (!url) return [];
  const noQuery = stripResizeParams(url);
  const variants = new Set();
  variants.add(noQuery);
  variants.add(url);
  const suffixRx = /-(thumb|small|medium|large)(\.[a-z0-9]{2,5})$/i;
  if (suffixRx.test(noQuery)) {
    variants.add(noQuery.replace(suffixRx, '$2'));
    variants.add(noQuery.replace(suffixRx, '-fullsize$2'));
    variants.add(noQuery.replace(suffixRx, '-original$2'));
    variants.add(noQuery.replace(suffixRx, '-large$2'));
  }
  const prefixRx = /\/(thumb|small|medium|large)-/i;
  if (prefixRx.test(noQuery)) {
    variants.add(noQuery.replace(prefixRx, '/'));
    variants.add(noQuery.replace(prefixRx, '/fullsize-'));
    variants.add(noQuery.replace(prefixRx, '/original-'));
  }
  return [...variants];
}
function loadImageDims(src, timeout = 6000) {
  return new Promise((resolve) => {
    const im = new Image();
    let done = false;
    const finish = (v) => { if (done) return; done = true; clearTimeout(timer); resolve(v); };
    const timer = setTimeout(() => finish(null), timeout);
    im.onload = () => finish({ w: im.naturalWidth, h: im.naturalHeight });
    im.onerror = () => finish(null);
    im.src = src;
  });
}
const variantLimiter = createLimiter(4);
async function pickBestVariant(originalUrl) {
  const variants = generateVariants(originalUrl);
  const results = await Promise.all(
    variants.map(url => variantLimiter(async () => {
      const dims = await loadImageDims(url);
      if (!dims || !dims.w || !dims.h) return null;
      return { url, w: dims.w, h: dims.h, area: dims.w * dims.h };
    }))
  );
  const valid = results.filter(Boolean).sort((a, b) => b.area - a.area);
  const winner = valid[0];
  if (!winner) return { url: originalUrl, w: 0, h: 0, isHighest: false };
  return { ...winner, isHighest: winner.url !== originalUrl };
}

/* ---------- Blob fetch + cache ---------- */
const blobCache = new Map();
async function isImageBlob(blob) {
  if (!blob || blob.size < 12) return false;
  try {
    const buf = new Uint8Array(await blob.slice(0, 12).arrayBuffer());
    if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return true;
    if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return true;
    if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return true;
    if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46) return true;
    if (buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70) return true;
    return false;
  } catch { return false; }
}
async function fetchImageBlob(url) {
  if (blobCache.has(url)) return blobCache.get(url);
  const promise = (async () => {
    try {
      const r = await fetch(url, { mode: 'cors' });
      if (r.ok) {
        const b = await r.blob();
        if (await isImageBlob(b)) return b;
      }
    } catch {}
    for (const proxy of orderedProxies()) {
      try {
        const r = await fetch(proxy.build(url));
        if (!r.ok) continue;
        const b = await r.blob();
        if (await isImageBlob(b)) { setPreferredProxy(proxy.id); return b; }
      } catch {}
    }
    throw makeErr('network');
  })();
  blobCache.set(url, promise);
  try { return await promise; }
  catch (e) { blobCache.delete(url); throw e; }
}

/* ---------- Convert ---------- */
function blobToImage(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('load failed')); };
    img.src = url;
  });
}
/* Firefox güvenilirliği: eğer blob zaten hedef formattaysa
   canvas'a hiç girmeden direkt blob'u döndür. */
async function convertImage(blob, format, quality = 0.95) {
  if (format === 'original') return blob;

  const currentType = (blob.type || '').toLowerCase();
  const targetType = format === 'jpeg' ? 'image/jpeg' : `image/${format}`;

  if (currentType === targetType) return blob;
  if (format === 'jpeg' && currentType === 'image/jpg') return blob;

  const img = await blobToImage(blob);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (format === 'jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (!b) { reject(new Error('toBlob failed')); return; }
        if (b.type !== targetType) {
          b = new Blob([b], { type: targetType });
        }
        resolve(b);
      },
      targetType,
      format === 'png' ? undefined : quality
    );
  });
}

/* ---------- Helpers ---------- */
function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return null;
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
function extFromUrl(url) {
  try {
    const clean = url.split('?')[0];
    const m = clean.match(/\.([a-z0-9]{2,5})$/i);
    return m ? m[1].toLowerCase() : 'webp';
  } catch { return 'webp'; }
}
function extForFormat(fmt, fallback) {
  if (fmt === 'png') return 'png';
  if (fmt === 'jpeg') return 'jpg';
  if (fmt === 'webp') return 'webp';
  return fallback || 'webp';
}

/* ---------- Download ---------- */
/* Not: Firefox, belirli görsel türlerini (özellikle webp) blob: URL üzerinden
   `download` özniteliğiyle indirirken, dosyayı diske kaydetmenin yanında
   kendi görüntüleyicisinde ayrı bir sekmede de açabiliyor. Bu, MIME tipinden
   (octet-stream dahil) ve `blob:`/`data:` URI seçiminden bağımsız, Firefox'un
   kendi içerik-önizleme davranışı; sayfa tarafında güvenilir biçimde
   engellenemiyor. İndirme yine de doğru dosyayı, doğru adla ve orijinal
   baytlarla diske kaydediyor — ekstra sekme sadece görsel bir önizleme. */
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none;';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    if (a.parentNode) a.parentNode.removeChild(a);
    URL.revokeObjectURL(url);
  }, 10000);
}
function ensureBlob(asset) {
  if (asset.blob) return Promise.resolve(asset.blob);
  return fetchImageBlob(asset.url).then(b => { asset.blob = b; return b; });
}
async function handleDownload() {
  const asset = state.assets[state.activeTab];
  if (!asset) return;
  downloadBtn.disabled = true;
  downloadBtn.dataset.busy = '1';
  const originalLabel = downloadBtn.textContent;
  downloadBtn.textContent = t().preparing;
  try {
    const blob = await ensureBlob(asset);
    const fmt = currentFormat;
    let outBlob = blob;
    let ext = asset.ext || extFromUrl(asset.url);

    if (fmt !== 'original') {
      try {
        outBlob = await convertImage(blob, fmt);
        ext = extForFormat(fmt, ext);
      } catch {
        toast(t().toastConvertFailed, 'error');
        return;
      }
    }

    const finalBlob = new Blob([outBlob], { type: 'application/octet-stream' });

    await triggerDownload(finalBlob, `${state.username}-${state.activeTab}.${ext}`);
    toast(t().toastDownloaded);
  } catch {
    toast(t().toastDownloadFailed, 'error');
  } finally {
    downloadBtn.disabled = false;
    delete downloadBtn.dataset.busy;
    downloadBtn.textContent = originalLabel;
  }
}

/* ---------- Copy / Share / QR ---------- */

/* Görseli panoya PNG olarak kopyala */
async function handleCopyImage() {
  const asset = state.assets[state.activeTab];
  if (!asset) return;
  try {
    if (!navigator.clipboard || !window.ClipboardItem) throw new Error('unsupported');
    let blob = await ensureBlob(asset);
    if (blob.type !== 'image/png') blob = await convertImage(blob, 'png');
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    toast(t().toastCopied);
  } catch { toast(t().toastCopyFailed, 'error'); }
}

/* SİTE linkini kopyala: https://wek1d.github.io/hdkicks/#u=kullanici */
async function handleCopyLink() {
  try {
    const url = shareUrl(state.username);
    await navigator.clipboard.writeText(url);
    toast(t().toastLinkCopied);
  } catch { toast(t().toastCopyFailed, 'error'); }
}

/* Paylaş: öncelikle site linkini paylaş (promosyon için),
   başarısız olursa / desteklenmezse görsel dosyasını paylaş. */
async function handleShare() {
  const url = shareUrl(state.username);
  const title = t().shareTitle(state.username);
  const text = t().shareText(state.username);

  try {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (e) {
        if (e && e.name === 'AbortError') return;
      }
      const asset = state.assets[state.activeTab];
      if (asset && navigator.canShare) {
        const blob = await ensureBlob(asset);
        const ext = asset.ext || extFromUrl(asset.url);
        const file = new File([blob], `${state.username}-${state.activeTab}.${ext}`,
          { type: blob.type || 'image/webp' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title, text });
          return;
        }
      }
      await navigator.clipboard.writeText(url);
      toast(t().toastLinkCopied);
      return;
    }
    await navigator.clipboard.writeText(url);
    toast(t().toastLinkCopied);
  } catch (e) {
    if (e && e.name === 'AbortError') return;
    toast(t().toastNoShare, 'error');
  }
}

function handleQr() {
  const url = shareUrl(state.username);
  qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=480x480&margin=10&bgcolor=ffffff&color=000000&data=${encodeURIComponent(url)}`;
  qrUrl.textContent = url;
  qrModal.hidden = false;
  requestAnimationFrame(() => qrModal.classList.add('open'));
}
function closeQr() {
  qrModal.classList.remove('open');
  qrModal.addEventListener('transitionend', () => { qrModal.hidden = true; }, { once: true });
}
qrUrl.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(qrUrl.textContent); toast(t().toastQrCopied); } catch {}
});
qrModal.addEventListener('click', (e) => {
  if (e.target === qrModal || e.target.classList.contains('qr-card')) closeQr();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !qrModal.hidden) closeQr();
});

/* ---------- Tabs ---------- */
function getActiveAsset() { return state.assets[state.activeTab]; }
function setActiveTab(tab) {
  state.activeTab = tab;
  tabAvatar.classList.toggle('active', tab === 'avatar');
  tabBanner.classList.toggle('active', tab === 'banner');
  renderPreview();
}
tabAvatar.addEventListener('click', () => setActiveTab('avatar'));
tabBanner.addEventListener('click', () => setActiveTab('banner'));

function renderPreview() {
  const asset = state.assets[state.activeTab];
  if (!asset) return;
  previewFrame.classList.remove('loaded');
  previewImg.classList.remove('loaded');
  previewImg.removeAttribute('srcset');
  previewImg.src = asset.url;
  previewImg.srcset = `${asset.url} 1x, ${asset.url} 2x`;
  previewImg.onload = () => {
    previewImg.classList.add('loaded');
    previewFrame.classList.add('loaded');
  };
  if (previewImg.complete && previewImg.naturalWidth) {
    previewImg.classList.add('loaded');
    previewFrame.classList.add('loaded');
  }
  renderSpecs();
}
function renderSpecs() {
  const asset = state.assets[state.activeTab];
  if (!asset) { resultSpecs.textContent = ''; return; }
  const parts = [];
  if (asset.w && asset.h) parts.push(`${asset.w} × ${asset.h}px`);
  else parts.push(t().original);
  const ext = (asset.ext || extFromUrl(asset.url)).toUpperCase();
  parts.push(ext);
  if (asset.size) parts.push(formatBytes(asset.size));
  const html = parts.map(p => `<span>${p}</span>`).join('<span class="sep">·</span>');
  const badge = asset.isHighest
    ? `<span class="badge">${t().qualityHighest}</span>`
    : `<span class="badge muted">${t().qualitySource}</span>`;
  resultSpecs.innerHTML = html + `<span class="sep">·</span>` + badge;
}

/* ---------- Lightbox ---------- */
function openLightbox(src) {
  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  const lstage = document.createElement('div');
  lstage.className = 'lb-stage';
  const closeBtn = document.createElement('button');
  closeBtn.className = 'lb-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.setAttribute('aria-label', t().closeAria);
  const img = document.createElement('img');
  img.src = src;
  img.draggable = false;
  const tag = document.createElement('span');
  tag.className = 'lb-tag';
  tag.textContent = 'hdkicks';
  const hint = document.createElement('span');
  hint.className = 'lb-hint';
  hint.textContent = t().zoomHint;

  lstage.appendChild(img);
  overlay.appendChild(lstage);
  overlay.appendChild(tag);
  overlay.appendChild(hint);
  overlay.appendChild(closeBtn);
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('open'));

  const ZOOM_1 = 2.2, ZOOM_2 = 3.6;
  const canPan = window.matchMedia('(pointer: fine)').matches;
  let zoomed = false;
  let clickTimer = null;

  function setOrigin(e) {
    const rect = img.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    img.style.transformOrigin = `${Math.max(0, Math.min(100, x))}% ${Math.max(0, Math.min(100, y))}%`;
  }
  function onPan(e) { setOrigin(e); }
  function zoomIn(e, level) {
    setOrigin(e);
    img.style.transform = `scale(${level})`;
    img.classList.add('zoomed');
    zoomed = true;
    if (canPan) img.addEventListener('mousemove', onPan);
  }
  function zoomOut() {
    img.style.transform = '';
    img.style.transformOrigin = '';
    img.classList.remove('zoomed');
    zoomed = false;
    img.removeEventListener('mousemove', onPan);
  }
  img.addEventListener('click', (e) => {
    e.stopPropagation();
    if (clickTimer) { clearTimeout(clickTimer); clickTimer = null; return; }
    const ev = { clientX: e.clientX, clientY: e.clientY };
    clickTimer = setTimeout(() => {
      clickTimer = null;
      zoomed ? zoomOut() : zoomIn(ev, ZOOM_1);
    }, 230);
  });
  img.addEventListener('dblclick', (e) => {
    e.stopPropagation();
    if (clickTimer) { clearTimeout(clickTimer); clickTimer = null; }
    zoomed ? zoomOut() : zoomIn(e, ZOOM_2);
  });
  function close() {
    overlay.classList.remove('open');
    overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e) { if (e.key === 'Escape') close(); }
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target === closeBtn) close();
  });
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', onKey);
}

/* ---------- State rendering ---------- */
function showState(name) {
  const wasHidden = !stage.classList.contains('shown');
  stage.classList.add('shown');
  Object.entries(states).forEach(([k, el]) => el.classList.toggle('active', k === name));
  if (wasHidden && isMobile) {
    requestAnimationFrame(() => stage.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }
}
function renderError(type, username) {
  lastErrorState = { type, username };
  const d = t();
  if (type === 'notFound') {
    errorTitle.textContent = d.notFoundTitle;
    errorDetail.textContent = d.notFoundDetail(username);
  } else if (type === 'noPic') {
    errorTitle.textContent = d.noPicTitle;
    errorDetail.textContent = d.noPicDetail(username);
  } else if (type === 'rateLimit') {
    errorTitle.textContent = d.rateLimitTitle;
    errorDetail.textContent = d.rateLimitDetail;
  } else if (type === 'serverError') {
    errorTitle.textContent = d.serverTitle;
    errorDetail.textContent = d.serverDetail;
  } else {
    errorTitle.textContent = d.connTitle;
    errorDetail.textContent = d.connDetail;
  }
  showState('error');
}

/* ---------- Main ---------- */
async function run(rawInput) {
  const username = extractUsername(rawInput);
  if (!username) return;
  lastErrorState = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    goBtn.disabled = true;
    loadingText.textContent = attempt === 0 ? t().loading : t().retrying;
    showState('loading');
    previewFrame.classList.remove('loaded');
    previewImg.classList.remove('loaded');
    previewImg.removeAttribute('src');
    previewImg.removeAttribute('srcset');
    resultSpecs.textContent = '';

    try {
      const data = await retry(() => fetchChannel(username), { retries: 1, minTimeout: 900 });
      const originalPic = data && data.user && data.user.profile_pic;
      if (!originalPic) { renderError('noPic', username); goBtn.disabled = false; return; }

      const resolvedUsername = (data.user && data.user.username) || username;
      state.username = resolvedUsername;
      pushHistory(resolvedUsername);
      updateUrl(resolvedUsername);

      const avatarBest = await pickBestVariant(originalPic);
      state.assets.avatar = {
        url: avatarBest.url, w: avatarBest.w, h: avatarBest.h,
        isHighest: avatarBest.isHighest, ext: extFromUrl(avatarBest.url),
        size: null, blob: null,
      };

      const bannerUrl =
        (data.banner_image && (data.banner_image.url || (data.banner_image.responsive_urls && data.banner_image.responsive_urls[0]))) ||
        (data.user && data.user.banner_image && data.user.banner_image.url) ||
        null;
      if (bannerUrl) {
        const bannerBest = await pickBestVariant(bannerUrl);
        state.assets.banner = {
          url: bannerBest.url, w: bannerBest.w, h: bannerBest.h,
          isHighest: bannerBest.isHighest, ext: extFromUrl(bannerBest.url),
          size: null, blob: null,
        };
        resultTabs.hidden = false;
      } else {
        state.assets.banner = null;
        resultTabs.hidden = true;
      }

      state.activeTab = 'avatar';
      tabAvatar.classList.add('active');
      tabBanner.classList.remove('active');

      resultUsername.textContent = `@${resolvedUsername}`;
      renderPreview();
      showState('result');
      onIdle(enrichSizes);

      goBtn.disabled = false;
      return;
    } catch (e) {
      const type = (e && e.type) || 'network';
      const retryable = type === 'network' || type === 'rateLimit' || type === 'serverError';
      if (retryable && attempt === 0) { await sleep(1400); continue; }
      renderError(type, username);
      goBtn.disabled = false;
      return;
    }
  }
}
async function enrichSizes() {
  for (const key of ['avatar', 'banner']) {
    const asset = state.assets[key];
    if (!asset) continue;
    try {
      const blob = await ensureBlob(asset);
      asset.size = blob.size;
      asset.ext = (blob.type && blob.type.split('/')[1]) || asset.ext;
      if (state.activeTab === key) renderSpecs();
    } catch {}
  }
}

/* ---------- Events ---------- */
form.addEventListener('submit', (e) => { e.preventDefault(); run(queryInput.value); });
retryBtn.addEventListener('click', () => {
  if (lastErrorState && lastErrorState.username) {
    queryInput.value = lastErrorState.username;
    run(lastErrorState.username);
  }
});
downloadBtn.addEventListener('click', handleDownload);
openBtn.addEventListener('click', () => {
  const asset = getActiveAsset();
  if (asset) openLightbox(asset.url);
});
previewFrame.addEventListener('click', () => {
  const asset = getActiveAsset();
  if (asset) openLightbox(asset.url);
});
copyImgBtn.addEventListener('click', handleCopyImage);
copyLinkBtn.addEventListener('click', handleCopyLink);
shareBtn.addEventListener('click', handleShare);
qrBtn.addEventListener('click', handleQr);

queryInput.addEventListener('paste', (e) => {
  const text = (e.clipboardData || window.clipboardData).getData('text') || '';
  if (/^https?:\/\/(www\.)?kick\.com\//i.test(text.trim())) {
    setTimeout(() => run(text), 0);
  }
});

/* ---------- Logo → ana sayfa ---------- */
$('logo').addEventListener('click', (e) => {
  e.preventDefault();
  try { history.replaceState(null, '', location.pathname); } catch {}
  queryInput.value = '';
  stage.classList.remove('shown');
  goBtn.disabled = false;
  previewImg.removeAttribute('src');
  previewImg.removeAttribute('srcset');
  previewFrame.classList.remove('loaded');
  resultSpecs.textContent = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(() => queryInput.focus(), 250);
});

/* ---------- Init ---------- */
applyStaticText();
renderHistory();

/* Açılışta #u=kullanıcı (yeni) veya ?u=kullanıcı (eski linkler)
   varsa otomatik çek. Backward-compatible. */
(function autoFromUrl() {
  try {
    let u = null;
    if (location.hash) {
      const m = location.hash.match(/^#u=([^&]+)/);
      if (m) u = decodeURIComponent(m[1]);
    }
    if (!u) {
      const params = new URLSearchParams(location.search);
      u = params.get('u');
    }
    if (u) {
      queryInput.value = u;
      run(u);
    }
  } catch {}
})();

})();