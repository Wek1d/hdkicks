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
async function retry(fn, { retries = 2, minTimeout = 600, factor = 2, shouldRetry = () => true } = {}) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try { return await fn(i); }
    catch (e) {
      lastErr = e;
      if (i === retries || !shouldRetry(e)) break;
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
    enhanceBtn: 'Yükselt',
    enhancePreparing: 'yükseltiliyor…',
    openBtn: 'Tam boy',
    copyImgBtn: 'Görseli kopyala',
    copyLinkBtn: 'Linki kopyala',
    shareBtn: 'Paylaş',
    qrTitle: 'Bu sonucu paylaş',
    toastUpscaled: 'Görsel yükseltildi',
    toastEnhanceFailed: 'Yükseltme başarısız',
    viewOriginal: 'Orijinal',
    viewEnhanced: 'Yükseltilmiş',
    viewClean: 'Sade ×2',
    viewStrong: 'Güçlü ×4',
    hintOriginal: 'Kick’teki dosya, dokunulmadan',
    hintClean: 'Sadece büyütür, renklere dokunmaz',
    hintStrong: 'Büyütür ve detayı keskinleştirir',
    upscaling: 'yükseltiliyor…',
    followersLabel: 'takipçi',
    verifiedLabel: 'Doğrulanmış yayıncı',
    tabAvatar: 'Avatar',
    tabBanner: 'Banner',
    kickOpenBtn: "Kick'te aç",
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
    enhanceBtn: 'Upscale',
    enhancePreparing: 'upscaling…',
    openBtn: 'Full size',
    copyImgBtn: 'Copy image',
    copyLinkBtn: 'Copy link',
    shareBtn: 'Share',
    qrTitle: 'Share this result',
    toastUpscaled: 'Image enhanced',
    toastEnhanceFailed: 'Upscale failed',
    viewOriginal: 'Original',
    viewEnhanced: 'Upscaled',
    viewClean: 'Clean ×2',
    viewStrong: 'Strong ×4',
    hintOriginal: 'The file on Kick, untouched',
    hintClean: 'Upscale only, colors untouched',
    hintStrong: 'Upscale plus detail sharpening',
    upscaling: 'upscaling…',
    followersLabel: 'followers',
    verifiedLabel: 'Verified streamer',
    tabAvatar: 'Avatar',
    tabBanner: 'Banner',
    kickOpenBtn: 'Open on Kick',
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
  slug: '',
  channel: { followers: null, verified: false },
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
const resultFollowers = $('result-followers');
const verifiedBadge = $('verified-badge');
const modeSwitch = $('mode-switch');
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
const kickOpenBtn = $('kick-open-btn');
const kickOpenText = $('kick-open-text');
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
    if (state.assets.avatar || state.assets.banner) {
      renderPreview();
    }
  });
});
document.addEventListener('click', (e) => {
  if (!formatMenu.classList.contains('open')) return;
  if (!formatTrigger.contains(e.target) && !formatMenu.contains(e.target)) closeFormatMenu();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && formatMenu.classList.contains('open')) closeFormatMenu();
});

/* ---------- Mode switch labels + channel meta ---------- */
function applyModeLabels() {
  if (!modeSwitch) return;
  const d = t();
  const map = {
    original: [d.viewOriginal, d.hintOriginal],
    clean: [d.viewClean, d.hintClean],
    strong: [d.viewStrong, d.hintStrong],
  };
  modeSwitch.querySelectorAll('.mode-btn').forEach((btn) => {
    const entry = map[btn.dataset.mode];
    if (!entry) return;
    btn.textContent = entry[0];
    btn.title = entry[1];
  });
}
function pickFollowers(data) {
  const candidates = [
    data.followers_count, data.followersCount,
    data.user && data.user.followers_count, data.user && data.user.followersCount,
  ];
  for (const v of candidates) {
    if (v !== null && v !== undefined && v !== '' && Number.isFinite(Number(v))) return Number(v);
  }
  return null;
}
function renderChannelMeta() {
  const ch = state.channel;
  const d = t();
  verifiedBadge.hidden = !ch.verified;
  verifiedBadge.title = d.verifiedLabel;
  verifiedBadge.setAttribute('aria-label', d.verifiedLabel);
  if (ch.followers === null) { resultFollowers.hidden = true; return; }
  const compact = new Intl.NumberFormat(lang, { notation: 'compact', maximumFractionDigits: 1 }).format(ch.followers);
  const full = new Intl.NumberFormat(lang).format(ch.followers);
  resultFollowers.hidden = false;
  resultFollowers.title = `${full} ${d.followersLabel}`;
  resultFollowers.innerHTML = `<b>${compact}</b> ${d.followersLabel}`;
}

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
  applyModeLabels();
  kickOpenText.textContent = d.kickOpenBtn;
  kickOpenBtn.setAttribute('aria-label', `${d.kickOpenBtn} — kick.com/${state.slug || state.username || ''}`);
  historyLabel.textContent = d.historyLabel;
  historyClear.textContent = d.historyClear;
  qrTitle.textContent = d.qrTitle;
  if (!downloadBtn.dataset.busy) downloadBtn.textContent = d.downloadBtn;
  document.querySelectorAll('.lang-pill button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  updateFormatUI();
  if (lastErrorState) renderError(lastErrorState.type, lastErrorState.username);
  if (state.assets.avatar) { renderSpecs(); renderChannelMeta(); }
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
      if (!res.ok && res.status !== 404 && res.status !== 429) throw new Error('HTTP ' + res.status);
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

/* Kick'te kanal linki (slug) '-' kullanır, kullanıcı adı ise '_' içerebilir
   (arda_kececi → kick.com/arda-kececi). Bulunamazsa ayracın tersini dene. */
function usernameCandidates(username) {
  const list = [username];
  if (/[-_]/.test(username)) {
    list.push(username.replace(/_/g, '-'), username.replace(/-/g, '_'));
  }
  return [...new Set(list)];
}
async function fetchChannelSmart(username) {
  let lastErr;
  for (const candidate of usernameCandidates(username)) {
    try {
      return { data: await fetchChannel(candidate), slug: candidate };
    } catch (e) {
      lastErr = e;
      if (!(e && e.type === 'notFound')) throw e;
    }
  }
  throw lastErr;
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
function extractStructuredImageUrls(input) {
  const seen = new Set();
  const add = (value) => {
    if (!value || typeof value !== 'string') return;
    const clean = value.trim();
    if (!clean || clean.startsWith('data:')) return;
    try {
      const normalized = stripResizeParams(clean);
      if (normalized) seen.add(normalized);
    } catch { seen.add(clean); }
  };

  if (Array.isArray(input)) {
    input.forEach(add);
    return [...seen];
  }

  if (typeof input === 'string') {
    add(input);
    return [...seen];
  }

  if (!input || typeof input !== 'object') return [...seen];

  for (const key of ['url', 'src', 'image_url', 'original', 'fullsize', 'large', 'medium', 'small', 'thumbnail', 'cdn_url']) {
    add(input[key]);
  }

  if (Array.isArray(input.responsive_urls)) {
    input.responsive_urls.forEach(add);
  }
  if (Array.isArray(input.images)) {
    input.images.forEach((item) => {
      extractStructuredImageUrls(item).forEach((u) => seen.add(u));
    });
  }

  const srcsetStrings = [input.srcset, input.responsive];
  for (const srcset of srcsetStrings) {
    if (typeof srcset !== 'string') continue;
    for (const match of srcset.matchAll(/https?:\/\/[^\s,]+/gi)) {
      add(match[0]);
    }
  }

  return [...seen];
}
function generateVariants(rawInput) {
  const directCandidates = extractStructuredImageUrls(rawInput);
  const variants = new Set(directCandidates);

  for (const source of directCandidates) {
    if (!source) continue;
    const normalized = stripResizeParams(source);
    variants.add(normalized);
    variants.add(source);

    const suffixRx = /-(thumb|small|medium|large|fullsize|original)(\.[a-z0-9]{2,5})$/i;
    if (suffixRx.test(normalized)) {
      variants.add(normalized.replace(suffixRx, '$2'));
      variants.add(normalized.replace(suffixRx, '-fullsize$2'));
      variants.add(normalized.replace(suffixRx, '-original$2'));
      variants.add(normalized.replace(suffixRx, '-large$2'));
    }

    const prefixRx = /\/(thumb|small|medium|large)-/i;
    if (prefixRx.test(normalized)) {
      variants.add(normalized.replace(prefixRx, '/'));
      variants.add(normalized.replace(prefixRx, '/fullsize-'));
      variants.add(normalized.replace(prefixRx, '/original-'));
    }

    if (/\/conversion\//i.test(normalized)) {
      const match = normalized.match(/^(.*-)(fullsize|original)(\.[a-z0-9]+)$/i);
      if (match) {
        variants.add(match[1] + 'original' + match[3]);
        variants.add(match[1] + 'fullsize' + match[3]);
      }
      const pngAlt = normalized.replace(/\.[a-z0-9]+$/i, '.png');
      const webpAlt = normalized.replace(/\.[a-z0-9]+$/i, '.webp');
      if (pngAlt !== normalized) variants.add(pngAlt);
      if (webpAlt !== normalized) variants.add(webpAlt);
    }
  }

  return [...variants].filter(Boolean);
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
async function pickBestVariant(rawInput) {
  const direct = extractStructuredImageUrls(rawInput);
  const alreadyTopTier = direct.length === 1 && /-(fullsize|original)\.[a-z0-9]{2,5}$/i.test(direct[0]);
  const variants = alreadyTopTier ? direct : generateVariants(rawInput);
  const fallbackUrl = typeof rawInput === 'string' ? rawInput : rawInput && (rawInput.url || rawInput.src || rawInput.image_url || '');
  const results = await Promise.all(
    variants.map(url => variantLimiter(async () => {
      const dims = await loadImageDims(url);
      if (!dims || !dims.w || !dims.h) return null;
      return { url, w: dims.w, h: dims.h, area: dims.w * dims.h };
    }))
  );
  const valid = results.filter(Boolean).sort((a, b) => b.area - a.area);
  const winner = valid[0];
  if (!winner) return { url: fallbackUrl, w: 0, h: 0, isHighest: false };
  return { ...winner, isHighest: winner.url !== fallbackUrl };
}

/* ---------- Blob fetch + cache ---------- */
const blobCache = new Map();
async function sniffImage(blob) {
  if (!blob || blob.size < 12) return null;
  try {
    const b = new Uint8Array(await blob.slice(0, 12).arrayBuffer());
    const ascii = (s, e) => String.fromCharCode(...b.slice(s, e));
    if (b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF) return 'image/jpeg';
    if (b[0] === 0x89 && ascii(1, 4) === 'PNG') return 'image/png';
    if (ascii(0, 3) === 'GIF') return 'image/gif';
    if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'image/webp';
    if (ascii(4, 8) === 'ftyp') {
      const brand = ascii(8, 12);
      if (brand === 'avif' || brand === 'avis') return 'image/avif';
      if (brand.startsWith('he')) return 'image/heic';
    }
    return null;
  } catch { return null; }
}
/* MIME tipi gerçek baytlardan belirlenir; proxy'ler yanlış Content-Type
   döndürebildiği için blob.type'a güvenmiyoruz. */
async function normalizeImageBlob(b) {
  const mime = await sniffImage(b);
  if (!mime) return null;
  return b.type === mime ? b : new Blob([b], { type: mime });
}
async function fetchImageBlob(url) {
  if (blobCache.has(url)) return blobCache.get(url);
  const promise = (async () => {
    try {
      const r = await fetch(url, { mode: 'cors' });
      if (r.ok) {
        const b = await normalizeImageBlob(await r.blob());
        if (b) return b;
      }
    } catch {}
    for (const proxy of orderedProxies()) {
      try {
        const r = await fetch(proxy.build(url));
        if (!r.ok) continue;
        const b = await normalizeImageBlob(await r.blob());
        if (b) { setPreferredProxy(proxy.id); return b; }
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
function extFromBlob(blob, fallback) {
  const map = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif', 'image/heic': 'heic' };
  return (blob && map[blob.type]) || fallback || 'webp';
}
function extForFormat(fmt, fallback) {
  if (fmt === 'png') return 'png';
  if (fmt === 'jpeg') return 'jpg';
  if (fmt === 'webp') return 'webp';
  return fallback || 'webp';
}
function getSafeFilename(baseName, mode, ext, tab) {
  const clean = String(baseName || 'kick').toLowerCase().replace(/[^a-z0-9._-]+/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const kind = mode === 'clean' || mode === 'strong' ? mode : 'original';
  const part = tab === 'banner' ? '-banner' : '';
  return `${clean}${part}-${kind}.${ext || 'png'}`;
}
function pngChunk(type, data) {
  const typeBytes = new TextEncoder().encode(type);
  const chunk = new Uint8Array(12 + data.length);
  const view = new DataView(chunk.buffer);
  view.setUint32(0, data.length);
  chunk.set(typeBytes, 4);
  chunk.set(data, 8);

  let crc = 0xffffffff;
  for (let i = 4; i < 8 + data.length; i++) {
    crc ^= chunk[i];
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  view.setUint32(8 + data.length, (crc ^ 0xffffffff) >>> 0);
  return chunk;
}
async function addPngMetadata(blob, username) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (!signature.every((byte, index) => bytes[index] === byte)) return blob;

  const metadata = {
    Title: `${username} Kick profile image`,
    Subject: 'Kick profile image',
    Author: 'Arda Keçeci',
    Description: `Kick profile image of ${username}, exported with hdkicks.`,
    Copyright: 'Copyright 2026 Arda Keçeci',
    Software: 'hdkicks',
    Source: 'Kick',
    GitHub: 'https://github.com/Wek1d/hdkicks',
    Keywords: 'Kick; profile image; hdkicks',
    Tags: 'Kick; profile image; hdkicks',
    Comment: 'Metadata added by hdkicks during export.',
  };
  const chunks = Object.entries(metadata).map(([keyword, value]) => {
    const keyBytes = Uint8Array.from(keyword, char => char.charCodeAt(0));
    const textBytes = Uint8Array.from(value, char => char.charCodeAt(0));
    const data = new Uint8Array(keyBytes.length + 1 + textBytes.length);
    data.set(keyBytes);
    data.set(textBytes, keyBytes.length + 1);
    return pngChunk('tEXt', data);
  });
  const escapeXml = value => String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
  })[char]);
  const safeUsername = escapeXml(username || 'Kick user');
  const xmp = `<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:xmp="http://ns.adobe.com/xap/1.0/" xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/" xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/"><dc:title><rdf:Alt><rdf:li xml:lang="x-default">${safeUsername} Kick profile image</rdf:li></rdf:Alt></dc:title><dc:creator><rdf:Seq><rdf:li>Arda Keçeci</rdf:li></rdf:Seq></dc:creator><dc:description><rdf:Alt><rdf:li xml:lang="x-default">Kick profile image of ${safeUsername}, exported with hdkicks.</rdf:li></rdf:Alt></dc:description><dc:subject><rdf:Bag><rdf:li>Kick</rdf:li><rdf:li>profile image</rdf:li><rdf:li>hdkicks</rdf:li></rdf:Bag></dc:subject><dc:rights><rdf:Alt><rdf:li xml:lang="x-default">Copyright 2026 Arda Keçeci</rdf:li></rdf:Alt></dc:rights><xmp:CreatorTool>hdkicks</xmp:CreatorTool><xmpRights:WebStatement>https://github.com/Wek1d/hdkicks</xmpRights:WebStatement><photoshop:Source>Kick</photoshop:Source><photoshop:Credit>hdkicks</photoshop:Credit></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="w"?>`;
  const encoder = new TextEncoder();
  const keyword = encoder.encode('XML:com.adobe.xmp');
  const xmpBytes = encoder.encode(xmp);
  const internationalText = new Uint8Array(keyword.length + 5 + xmpBytes.length);
  internationalText.set(keyword);
  internationalText.set(xmpBytes, keyword.length + 5);
  chunks.push(pngChunk('iTXt', internationalText));

  let offset = 8;
  while (offset + 12 <= bytes.length) {
    const length = new DataView(bytes.buffer, bytes.byteOffset + offset, 4).getUint32(0);
    if (String.fromCharCode(...bytes.subarray(offset + 4, offset + 8)) === 'IEND') break;
    offset += length + 12;
  }
  if (offset + 12 > bytes.length) return blob;

  const result = new Uint8Array(bytes.length + chunks.reduce((sum, chunk) => sum + chunk.length, 0));
  result.set(bytes.subarray(0, offset), 0);
  let writeOffset = offset;
  for (const chunk of chunks) {
    result.set(chunk, writeOffset);
    writeOffset += chunk.length;
  }
  result.set(bytes.subarray(offset), writeOffset);
  return new Blob([result], { type: 'image/png' });
}
/* ---------- Upscale ----------
   Tarayıcının bilinear büyütmesi yerine Lanczos-3 yeniden örnekleme.
   - clean : sadece 2× Lanczos. Renk/kontrast filtresi YOK.
   - strong: 2× → hafif keskinleştirme → 2× → keskinleştirme (kademeli büyütme
             tek seferde 4×'e göre daha net kenar verir). Keskinleştirme sadece
             parlaklık (luma) kanalında ve eşikli: cilt gibi düz alanlardaki
             gürültü büyütülmez, renkler kaymaz. */
const UPSCALE_PRESETS = {
  clean: [{ scale: 2 }],
  strong: [
    { scale: 2, sharpen: { amount: 0.40, sigma: 0.9, threshold: 3 } },
    { scale: 2, sharpen: { amount: 0.55, sigma: 1.4, threshold: 4 } },
  ],
};
const MAX_OUTPUT_PIXELS = 16e6;
const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));

function lanczos3(x) {
  if (x === 0) return 1;
  if (x <= -3 || x >= 3) return 0;
  const px = Math.PI * x;
  return (3 * Math.sin(px) * Math.sin(px / 3)) / (px * px);
}
function buildLanczosWeights(srcLen, dstLen) {
  const taps = 6;
  const ratio = dstLen / srcLen;
  const starts = new Int32Array(dstLen);
  const weights = new Float32Array(dstLen * taps);
  for (let i = 0; i < dstLen; i++) {
    const center = (i + 0.5) / ratio - 0.5;
    const start = Math.floor(center) - 2;
    let sum = 0;
    for (let k = 0; k < taps; k++) {
      const w = lanczos3(center - (start + k));
      weights[i * taps + k] = w;
      sum += w;
    }
    for (let k = 0; k < taps; k++) weights[i * taps + k] /= sum;
    starts[i] = start;
  }
  return { starts, weights, taps };
}
/* data: premultiplied RGBA Float32Array */
function resizeLanczos(data, sw, sh, dw, dh) {
  const hx = buildLanczosWeights(sw, dw);
  const tmp = new Float32Array(dw * sh * 4);
  for (let y = 0; y < sh; y++) {
    const rowIn = y * sw;
    for (let x = 0; x < dw; x++) {
      const s = hx.starts[x];
      let r = 0, g = 0, b = 0, a = 0;
      for (let k = 0; k < hx.taps; k++) {
        const sx = Math.min(sw - 1, Math.max(0, s + k));
        const w = hx.weights[x * hx.taps + k];
        const i = (rowIn + sx) * 4;
        r += data[i] * w; g += data[i + 1] * w; b += data[i + 2] * w; a += data[i + 3] * w;
      }
      const o = (y * dw + x) * 4;
      tmp[o] = r; tmp[o + 1] = g; tmp[o + 2] = b; tmp[o + 3] = a;
    }
  }
  const vy = buildLanczosWeights(sh, dh);
  const out = new Float32Array(dw * dh * 4);
  for (let y = 0; y < dh; y++) {
    const s = vy.starts[y];
    for (let x = 0; x < dw; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let k = 0; k < vy.taps; k++) {
        const sy = Math.min(sh - 1, Math.max(0, s + k));
        const w = vy.weights[y * vy.taps + k];
        const i = (sy * dw + x) * 4;
        r += tmp[i] * w; g += tmp[i + 1] * w; b += tmp[i + 2] * w; a += tmp[i + 3] * w;
      }
      const o = (y * dw + x) * 4;
      const al = Math.min(255, Math.max(0, a));
      out[o] = Math.min(al, Math.max(0, r));
      out[o + 1] = Math.min(al, Math.max(0, g));
      out[o + 2] = Math.min(al, Math.max(0, b));
      out[o + 3] = al;
    }
  }
  return out;
}
function gaussianBlur(src, w, h, sigma) {
  const r = Math.max(1, Math.ceil(sigma * 3));
  const kernel = new Float32Array(2 * r + 1);
  let sum = 0;
  for (let i = -r; i <= r; i++) { const v = Math.exp(-(i * i) / (2 * sigma * sigma)); kernel[i + r] = v; sum += v; }
  for (let i = 0; i < kernel.length; i++) kernel[i] /= sum;
  const tmp = new Float32Array(w * h);
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let acc = 0;
      for (let i = -r; i <= r; i++) acc += src[y * w + Math.min(w - 1, Math.max(0, x + i))] * kernel[i + r];
      tmp[y * w + x] = acc;
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let acc = 0;
      for (let i = -r; i <= r; i++) acc += tmp[Math.min(h - 1, Math.max(0, y + i)) * w + x] * kernel[i + r];
      out[y * w + x] = acc;
    }
  }
  return out;
}
function sharpenLuma(data, w, h, { amount, sigma, threshold }) {
  const n = w * h;
  const luma = new Float32Array(n);
  for (let i = 0; i < n; i++) luma[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  const blurred = gaussianBlur(luma, w, h, sigma);
  for (let i = 0; i < n; i++) {
    let diff = luma[i] - blurred[i];
    const ad = Math.abs(diff);
    if (ad <= threshold) continue;
    diff = Math.sign(diff) * (ad - threshold);
    const delta = Math.max(-40, Math.min(40, diff * amount));
    const a = data[i * 4 + 3];
    const o = i * 4;
    data[o] = Math.min(a, Math.max(0, data[o] + delta));
    data[o + 1] = Math.min(a, Math.max(0, data[o + 1] + delta));
    data[o + 2] = Math.min(a, Math.max(0, data[o + 2] + delta));
  }
}
async function upscaleBlob(blob, mode) {
  const stages = UPSCALE_PRESETS[mode];
  if (!stages) throw new Error('unknown mode');
  const img = await blobToImage(blob);
  let w = img.naturalWidth, h = img.naturalHeight;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('canvas not available');
  ctx.drawImage(img, 0, 0);
  const px = ctx.getImageData(0, 0, w, h).data;
  let data = new Float32Array(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const a = px[i * 4 + 3] / 255;
    data[i * 4] = px[i * 4] * a;
    data[i * 4 + 1] = px[i * 4 + 1] * a;
    data[i * 4 + 2] = px[i * 4 + 2] * a;
    data[i * 4 + 3] = px[i * 4 + 3];
  }
  let ran = 0;
  for (const stage of stages) {
    const dw = Math.round(w * stage.scale), dh = Math.round(h * stage.scale);
    if (dw * dh > MAX_OUTPUT_PIXELS) break;
    await nextFrame();
    data = resizeLanczos(data, w, h, dw, dh);
    w = dw; h = dh;
    if (stage.sharpen) sharpenLuma(data, w, h, stage.sharpen);
    ran++;
  }
  if (!ran) throw new Error('image too large to upscale');
  const outData = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const a = data[i * 4 + 3];
    const f = a > 0 ? 255 / a : 0;
    outData[i * 4] = data[i * 4] * f;
    outData[i * 4 + 1] = data[i * 4 + 1] * f;
    outData[i * 4 + 2] = data[i * 4 + 2] * f;
    outData[i * 4 + 3] = a;
  }
  const outCanvas = document.createElement('canvas');
  outCanvas.width = w; outCanvas.height = h;
  outCanvas.getContext('2d').putImageData(new ImageData(outData, w, h), 0, 0);
  const out = await new Promise((resolve, reject) =>
    outCanvas.toBlob((b) => (b ? resolve(b) : reject(new Error('upscale failed'))), 'image/png'));
  return { blob: out, w, h };
}
async function ensureVariant(asset, mode) {
  asset.variants = asset.variants || {};
  if (asset.variants[mode]) return asset.variants[mode];
  const source = await ensureBlob(asset);
  const r = await upscaleBlob(source, mode);
  asset.variants[mode] = { url: URL.createObjectURL(r.blob), blob: r.blob, w: r.w, h: r.h, size: r.blob.size };
  return asset.variants[mode];
}
/* Aktif görünüm: orijinal dosya ya da yükseltilmiş varyant */
function getView(asset) {
  const mode = asset.displayMode || 'original';
  const v = mode !== 'original' && asset.variants && asset.variants[mode];
  if (v) return { mode, url: v.url, blob: v.blob, w: v.w, h: v.h, ext: 'png' };
  return { mode: 'original', url: asset.url, blob: asset.blob, w: asset.w, h: asset.h, ext: asset.ext || extFromUrl(asset.url) };
}
async function getViewBlob(asset) {
  const view = getView(asset);
  return view.blob || ensureBlob(asset);
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
    const view = getView(asset);
    const sourceBlob = await getViewBlob(asset);
    let outBlob = sourceBlob;
    /* "Orijinal": Kick'ten gelen baytlar olduğu gibi, gerçek uzantısıyla iner. */
    let ext = view.mode === 'original' ? extFromBlob(sourceBlob, view.ext) : 'png';

    if (currentFormat !== 'original') {
      outBlob = await convertImage(sourceBlob, currentFormat);
      ext = extForFormat(currentFormat, ext);
    }

    if (outBlob.type === 'image/png') outBlob = await addPngMetadata(outBlob, state.username);

    const finalBlob = new Blob([outBlob], { type: 'application/octet-stream' });
    await triggerDownload(finalBlob, getSafeFilename(state.username, view.mode, ext, state.activeTab));
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
    let blob = await getViewBlob(asset);
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
        const view = getView(asset);
        const blob = await getViewBlob(asset);
        const ext = view.mode === 'original' ? extFromBlob(blob, view.ext) : 'png';
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
  const view = getView(asset);
  const currentUrl = view.url;
  previewFrame.classList.remove('loaded');
  previewImg.classList.remove('loaded');
  previewImg.removeAttribute('srcset');
  previewImg.src = currentUrl;
  previewImg.srcset = `${currentUrl} 1x, ${currentUrl} 2x`;
  previewImg.onload = () => {
    previewImg.classList.add('loaded');
    previewFrame.classList.add('loaded');
  };
  if (previewImg.complete && previewImg.naturalWidth) {
    previewImg.classList.add('loaded');
    previewFrame.classList.add('loaded');
  }
  if (modeSwitch) {
    modeSwitch.hidden = false;
    modeSwitch.querySelectorAll('.mode-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.mode === view.mode);
    });
  }
  renderSpecs();
}
async function getOutputMeta(asset) {
  const view = getView(asset);
  const sourceBlob = await getViewBlob(asset);
  let ext = view.mode === 'original' ? extFromBlob(sourceBlob, view.ext) : 'png';
  let size = sourceBlob.size;
  if (currentFormat !== 'original') {
    try {
      const outputBlob = await convertImage(sourceBlob, currentFormat);
      size = outputBlob.size;
      ext = extForFormat(currentFormat, ext);
    } catch {}
  }
  return { w: view.w, h: view.h, size, ext };
}
async function renderSpecs() {
  const asset = state.assets[state.activeTab];
  if (!asset) { resultSpecs.textContent = ''; return; }
  try {
    const meta = await getOutputMeta(asset);
    const parts = [];
    if (meta.w && meta.h) parts.push(`${meta.w} × ${meta.h}px`);
    else parts.push(t().original);
    parts.push((meta.ext || 'WEBP').toUpperCase());
    if (meta.size) parts.push(formatBytes(meta.size));
    const html = parts.map(p => `<span>${p}</span>`).join('<span class="sep">·</span>');
    const mode = getView(asset).mode;
    const badgeText = mode === 'strong' ? t().viewStrong : mode === 'clean' ? t().viewClean : t().viewOriginal;
    resultSpecs.innerHTML = html + `<span class="sep">·</span><span class="badge">${badgeText}</span>`;
  } catch {
    resultSpecs.textContent = '';
  }
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
      const { data, slug } = await retry(() => fetchChannelSmart(username), {
        retries: 1, minTimeout: 900,
        shouldRetry: (e) => !(e && e.type === 'notFound'),
      });
      const originalPic = data && data.user && data.user.profile_pic;
      if (!originalPic) { renderError('noPic', username); goBtn.disabled = false; return; }

      const resolvedUsername = (data.user && data.user.username) || username;
      state.username = resolvedUsername;
      state.slug = data.slug || slug;
      state.channel = {
        followers: pickFollowers(data),
        verified: !!(data.verified || (data.user && data.user.verified)),
      };
      pushHistory(resolvedUsername);
      updateUrl(resolvedUsername);

      const avatarBest = await pickBestVariant(originalPic);
      state.assets.avatar = {
        url: avatarBest.url, w: avatarBest.w, h: avatarBest.h,
        isHighest: avatarBest.isHighest, ext: extFromUrl(avatarBest.url),
        size: null, blob: null, displayMode: 'original', variants: {},
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
          size: null, blob: null, displayMode: 'original', variants: {},
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
      renderChannelMeta();
      kickOpenBtn.href = `https://kick.com/${encodeURIComponent(state.slug)}`;
      kickOpenBtn.setAttribute('aria-label', `${t().kickOpenBtn} — kick.com/${state.slug}`);
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
      asset.ext = extFromBlob(blob, asset.ext);
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
modeSwitch && modeSwitch.addEventListener('click', async (e) => {
  const btn = e.target.closest('.mode-btn');
  if (!btn || btn.disabled) return;
  const asset = state.assets[state.activeTab];
  if (!asset) return;
  const nextMode = ['clean', 'strong'].includes(btn.dataset.mode) ? btn.dataset.mode : 'original';
  if (nextMode === (asset.displayMode || 'original')) return;
  if (nextMode !== 'original' && !(asset.variants && asset.variants[nextMode])) {
    const buttons = modeSwitch.querySelectorAll('.mode-btn');
    buttons.forEach((b) => { b.disabled = true; });
    btn.textContent = t().upscaling;
    try {
      await ensureVariant(asset, nextMode);
    } catch {
      toast(t().toastEnhanceFailed, 'error');
      return;
    } finally {
      buttons.forEach((b) => { b.disabled = false; });
      applyModeLabels();
    }
  }
  asset.displayMode = nextMode;
  renderPreview();
});
openBtn.addEventListener('click', () => {
  const asset = getActiveAsset();
  if (asset) {
    openLightbox(getView(asset).url);
  }
});
previewFrame.addEventListener('click', () => {
  const asset = getActiveAsset();
  if (asset) {
    openLightbox(getView(asset).url);
  }
});
copyImgBtn.addEventListener('click', handleCopyImage);
copyLinkBtn.addEventListener('click', handleCopyLink);
shareBtn.addEventListener('click', handleShare);
qrBtn.addEventListener('click', handleQr);

/* "/" kısayolu: herhangi bir input'a yazmıyorken kullanıcı adı kutusuna odaklan */
document.addEventListener('keydown', (e) => {
  if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
  const tag = (document.activeElement && document.activeElement.tagName) || '';
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  e.preventDefault();
  queryInput.focus();
});

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
  kickOpenBtn.href = 'https://kick.com/';
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