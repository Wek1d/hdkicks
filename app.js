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
    zipBtn: 'ZIP indir',
    zipPreparing: 'ZIP hazırlanıyor…',
    toastZip: 'ZIP indirildi',
    toastColorCopied: (c) => `${c} kopyalandı`,
    paletteTitle: 'Rengi kopyala',
    faqTitle: 'Sık sorulanlar',
    faq1q: 'Kick profil fotoğrafı nasıl indirilir?',
    faq1a: 'Kullanıcı adını (ya da kick.com linkini) kutuya yaz, “Çek”e bas. Önizleme gelince “İndir”e tıklaman yeterli.',
    faq2q: 'Görsel kalitesi düşüyor mu?',
    faq2a: 'Hayır. “Orijinal” modda Kick\'in sunduğu en büyük dosya dokunulmadan iner. Sade ×2 ve Güçlü ×4 modları isteğe bağlıdır ve tarayıcında çalışır.',
    faq3q: 'Banner\'ı da indirebilir miyim?',
    faq3a: 'Kanalın banner\'ı varsa sonuç kartında Avatar / Banner sekmeleri çıkar; ikisini tek ZIP olarak da indirebilirsin.',
    faq4q: 'Verilerim saklanıyor mu?',
    faq4a: 'Sunucumuz yok. Son aramalar ve tercihlerin sadece kendi tarayıcında (localStorage) durur. Kick doğrudan erişime izin vermezse istek herkese açık CORS proxy\'leri üzerinden gider.',
  },
  en: {
    docTitle: 'hdkicks — Kick profile picture',
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
    zipBtn: 'Download ZIP',
    zipPreparing: 'building ZIP…',
    toastZip: 'ZIP downloaded',
    toastColorCopied: (c) => `${c} copied`,
    paletteTitle: 'Copy color',
    faqTitle: 'FAQ',
    faq1q: 'How do I download a Kick profile picture?',
    faq1a: 'Type the username (or paste a kick.com link) and hit “Fetch”. When the preview shows up, click “Download”.',
    faq2q: 'Does the image lose quality?',
    faq2a: 'No. In “Original” mode the largest file Kick offers is saved untouched. Clean ×2 and Strong ×4 are optional and run in your browser.',
    faq3q: 'Can I download the banner too?',
    faq3a: 'If the channel has a banner, the result card shows Avatar / Banner tabs, and you can grab both as a single ZIP.',
    faq4q: 'Is my data stored?',
    faq4a: 'There is no server. Recent searches and preferences stay in your own browser (localStorage). If Kick blocks direct access, requests go through public CORS proxies.',
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
const zipBtn = $('zip-btn');
const paletteEl = $('palette');
const resultCard = $('state-result');
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
  const fo = $('fmt-original'); if (fo) fo.textContent = d.formatOriginal;
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
  $('title').innerHTML = d.title;
  $('lede').textContent = d.lede;
  goBtn.textContent = d.goBtn;
  $('query').placeholder = d.queryPlaceholder;
  $('hint').innerHTML = `${d.hintPre}<code class="mono">${d.hintMono}</code>${d.hintPost}`;
  loadingText.textContent = d.loading;
  openBtn.textContent = d.openBtn;
  copyImgBtn.textContent = d.copyImgBtn;
  copyLinkBtn.textContent = d.copyLinkBtn;
  shareBtn.textContent = d.shareBtn;
  if (!zipBtn.dataset.busy) zipBtn.textContent = d.zipBtn;
  $('faq-title').textContent = d.faqTitle;
  for (let i = 1; i <= 4; i++) { $('faq-q' + i).textContent = d['faq' + i + 'q']; $('faq-a' + i).textContent = d['faq' + i + 'a']; }
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
    btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang));
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
/* Adres çubuğuna sadece #u=kullanıcı yazıyoruz: hash Google için ayrı sayfa
   sayılmaz (tek URL, tek sayfa) ama yenileyince / yer imine ekleyince sonuç korunur.
   replaceState hashchange tetiklemez, geçmişi de kirletmez. */
function updateUrl(username) {
  try {
    const hash = username ? `#u=${encodeURIComponent(username)}` : '';
    history.replaceState(null, '', location.pathname + location.search + hash);
  } catch {}
}
function usernameFromHash() {
  const m = location.hash.match(/^#u=([^&]+)/);
  if (!m) return null;
  try { return decodeURIComponent(m[1]); } catch { return null; }
}

/* ---------- Username extract ---------- */
function extractUsername(raw) {
  let v = (raw || '').trim();
  if (!v) return null;
  v = v.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/^kick\.com\//i, '').replace(/^@+/, '');
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
function fetchT(url, opts = {}, ms = 9000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { ...opts, signal: ctrl.signal }).finally(() => clearTimeout(timer));
}
/* Proxy'ler bazen 200 ile HTML/hata sayfası döndürür; JSON olarak çözülemezse
   bir sonraki proxy'ye geçilir (eskiden doğrudan 'bağlantı hatası' oluyordu). */
async function fetchJsonViaProxies(url) {
  let lastErr;
  for (const proxy of orderedProxies()) {
    try {
      const res = await fetchT(proxy.build(url), { headers: { Accept: 'application/json' } });
      if (res.status === 404 || res.status === 429) { setPreferredProxy(proxy.id); return { status: res.status, data: null }; }
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = JSON.parse(await res.text());
      setPreferredProxy(proxy.id);
      return { status: 200, data };
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error('proxy failed');
}

/* ---------- Channel fetch ---------- */
async function fetchChannel(username) {
  const apiUrl = `https://kick.com/api/v2/channels/${encodeURIComponent(username)}`;
  try {
    const direct = await fetchT(apiUrl, { headers: { Accept: 'application/json' } }, 5000);
    if (direct.ok) { try { return await direct.json(); } catch {} }
    else if (direct.status === 404) throw makeErr('notFound');
    else if (direct.status === 429) throw makeErr('rateLimit');
    else if (direct.status >= 500) throw makeErr('serverError');
  } catch (e) { if (e && e.type) throw e; }
  try {
    const r = await fetchJsonViaProxies(apiUrl);
    if (r.status === 404) throw makeErr('notFound');
    if (r.status === 429) throw makeErr('rateLimit');
    return r.data;
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
      const r = await fetchT(url, { mode: 'cors' }, 12000);
      if (r.ok) {
        const b = await normalizeImageBlob(await r.blob());
        if (b) return b;
      }
    } catch {}
    for (const proxy of orderedProxies()) {
      try {
        const r = await fetchT(proxy.build(url), {}, 12000);
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
    Description: `Kick profile image of ${username}, exported with hdkicks.`,
    Software: 'hdkicks',
    Source: 'Kick',
    GitHub: 'https://github.com/Wek1d/hdkicks',
    Keywords: 'Kick; profile image; hdkicks',
    Tags: 'Kick; profile image; hdkicks',
    Comment: 'Metadata added by hdkicks during export.',
  };
  const chunks = Object.entries(metadata).map(([keyword, value]) => {
    const latin1 = v => String(v).replace(/[^\x00-\xFF]/g, '?');
    const keyBytes = Uint8Array.from(latin1(keyword), char => char.charCodeAt(0));
    const textBytes = Uint8Array.from(latin1(value), char => char.charCodeAt(0));
    const data = new Uint8Array(keyBytes.length + 1 + textBytes.length);
    data.set(keyBytes);
    data.set(textBytes, keyBytes.length + 1);
    return pngChunk('tEXt', data);
  });
  const escapeXml = value => String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
  })[char]);
  const safeUsername = escapeXml(username || 'Kick user');
  const xmp = `<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:xmp="http://ns.adobe.com/xap/1.0/" xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/" xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/"><dc:title><rdf:Alt><rdf:li xml:lang="x-default">${safeUsername} Kick profile image</rdf:li></rdf:Alt></dc:title><dc:description><rdf:Alt><rdf:li xml:lang="x-default">Kick profile image of ${safeUsername}, exported with hdkicks.</rdf:li></rdf:Alt></dc:description><dc:subject><rdf:Bag><rdf:li>Kick</rdf:li><rdf:li>profile image</rdf:li><rdf:li>hdkicks</rdf:li></rdf:Bag></dc:subject><xmp:CreatorTool>hdkicks</xmp:CreatorTool><xmpRights:WebStatement>https://github.com/Wek1d/hdkicks</xmpRights:WebStatement><photoshop:Source>Kick</photoshop:Source><photoshop:Credit>hdkicks</photoshop:Credit></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="w"?>`;
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

/* Ağır işlem (Lanczos + keskinleştirme) ayrı thread'de çalışır: sayfa donmaz.
   Kaynak string olarak tutuluyor; build'de değişken isimleri küçültülse de bozulmaz. */
const UPSCALE_WORKER_SRC = `
function lanczos3(x){if(x===0)return 1;if(x<=-3||x>=3)return 0;var px=Math.PI*x;return(3*Math.sin(px)*Math.sin(px/3))/(px*px);}
function buildW(srcLen,dstLen){var taps=6,ratio=dstLen/srcLen,starts=new Int32Array(dstLen),weights=new Float32Array(dstLen*taps);
for(var i=0;i<dstLen;i++){var c=(i+0.5)/ratio-0.5,st=Math.floor(c)-2,sum=0;
for(var k=0;k<taps;k++){var w=lanczos3(c-(st+k));weights[i*taps+k]=w;sum+=w;}
for(var k2=0;k2<taps;k2++)weights[i*taps+k2]/=sum;starts[i]=st;}
return{starts:starts,weights:weights,taps:taps};}
function resize(data,sw,sh,dw,dh){var hx=buildW(sw,dw),tmp=new Float32Array(dw*sh*4);
for(var y=0;y<sh;y++){var rowIn=y*sw;for(var x=0;x<dw;x++){var s0=hx.starts[x],r=0,g=0,b=0,a=0;
for(var k=0;k<hx.taps;k++){var sx=Math.min(sw-1,Math.max(0,s0+k)),w=hx.weights[x*hx.taps+k],i=(rowIn+sx)*4;
r+=data[i]*w;g+=data[i+1]*w;b+=data[i+2]*w;a+=data[i+3]*w;}
var o=(y*dw+x)*4;tmp[o]=r;tmp[o+1]=g;tmp[o+2]=b;tmp[o+3]=a;}}
var vy=buildW(sh,dh),out=new Float32Array(dw*dh*4);
for(var y2=0;y2<dh;y2++){var s1=vy.starts[y2];for(var x2=0;x2<dw;x2++){var r2=0,g2=0,b2=0,a2=0;
for(var k3=0;k3<vy.taps;k3++){var sy=Math.min(sh-1,Math.max(0,s1+k3)),w2=vy.weights[y2*vy.taps+k3],i2=(sy*dw+x2)*4;
r2+=tmp[i2]*w2;g2+=tmp[i2+1]*w2;b2+=tmp[i2+2]*w2;a2+=tmp[i2+3]*w2;}
var o2=(y2*dw+x2)*4,al=Math.min(255,Math.max(0,a2));
out[o2]=Math.min(al,Math.max(0,r2));out[o2+1]=Math.min(al,Math.max(0,g2));out[o2+2]=Math.min(al,Math.max(0,b2));out[o2+3]=al;}}
return out;}
function blur(src,w,h,sigma){var r=Math.max(1,Math.ceil(sigma*3)),kernel=new Float32Array(2*r+1),sum=0;
for(var i=-r;i<=r;i++){var v=Math.exp(-(i*i)/(2*sigma*sigma));kernel[i+r]=v;sum+=v;}
for(var j=0;j<kernel.length;j++)kernel[j]/=sum;
var tmp=new Float32Array(w*h),out=new Float32Array(w*h);
for(var y=0;y<h;y++)for(var x=0;x<w;x++){var acc=0;for(var q=-r;q<=r;q++)acc+=src[y*w+Math.min(w-1,Math.max(0,x+q))]*kernel[q+r];tmp[y*w+x]=acc;}
for(var y2=0;y2<h;y2++)for(var x2=0;x2<w;x2++){var acc2=0;for(var q2=-r;q2<=r;q2++)acc2+=tmp[Math.min(h-1,Math.max(0,y2+q2))*w+x2]*kernel[q2+r];out[y2*w+x2]=acc2;}
return out;}
function sharpen(data,w,h,p){var n=w*h,luma=new Float32Array(n);
for(var i=0;i<n;i++)luma[i]=0.299*data[i*4]+0.587*data[i*4+1]+0.114*data[i*4+2];
var bl=blur(luma,w,h,p.sigma);
for(var j=0;j<n;j++){var diff=luma[j]-bl[j],ad=Math.abs(diff);if(ad<=p.threshold)continue;
diff=Math.sign(diff)*(ad-p.threshold);var delta=Math.max(-40,Math.min(40,diff*p.amount)),a=data[j*4+3],o=j*4;
data[o]=Math.min(a,Math.max(0,data[o]+delta));data[o+1]=Math.min(a,Math.max(0,data[o+1]+delta));data[o+2]=Math.min(a,Math.max(0,data[o+2]+delta));}}
self.onmessage=function(e){try{var m=e.data,w=m.w,h=m.h,px=new Uint8ClampedArray(m.buf),data=new Float32Array(w*h*4);
for(var i=0;i<w*h;i++){var a=px[i*4+3]/255;data[i*4]=px[i*4]*a;data[i*4+1]=px[i*4+1]*a;data[i*4+2]=px[i*4+2]*a;data[i*4+3]=px[i*4+3];}
var ran=0,scale=1;
for(var s=0;s<m.stages.length;s++){var st=m.stages[s],dw=Math.round(w*st.scale),dh=Math.round(h*st.scale);
if(dw*dh>m.max)break;data=resize(data,w,h,dw,dh);w=dw;h=dh;scale*=st.scale;if(st.sharpen)sharpen(data,w,h,st.sharpen);ran++;
self.postMessage({progress:ran/m.stages.length});}
if(!ran){self.postMessage({error:'too large'});return;}
var out=new Uint8ClampedArray(w*h*4);
for(var k=0;k<w*h;k++){var al=data[k*4+3],f=al>0?255/al:0;out[k*4]=data[k*4]*f;out[k*4+1]=data[k*4+1]*f;out[k*4+2]=data[k*4+2]*f;out[k*4+3]=al;}
self.postMessage({buf:out.buffer,w:w,h:h,scale:scale},[out.buffer]);}catch(err){self.postMessage({error:String(err&&err.message||err)});}};
`;

function runUpscaleWorker(buf, w, h, stages, onProgress) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(new Blob([UPSCALE_WORKER_SRC], { type: 'text/javascript' }));
    let worker;
    try { worker = new Worker(url); } catch (e) { URL.revokeObjectURL(url); reject(e); return; }
    const done = () => { worker.terminate(); URL.revokeObjectURL(url); };
    worker.onmessage = (ev) => {
      const m = ev.data;
      if (m.progress !== undefined) { if (onProgress) onProgress(m.progress); return; }
      done();
      if (m.error) reject(new Error(m.error)); else resolve(m);
    };
    worker.onerror = (ev) => { done(); reject(new Error(ev.message || 'worker failed')); };
    worker.postMessage({ buf, w, h, stages, max: MAX_OUTPUT_PIXELS }, [buf]);
  });
}
async function upscaleBlob(blob, mode, onProgress) {
  const stages = UPSCALE_PRESETS[mode];
  if (!stages) throw new Error('unknown mode');
  const img = await blobToImage(blob);
  const w0 = img.naturalWidth, h0 = img.naturalHeight;
  const canvas = document.createElement('canvas');
  canvas.width = w0; canvas.height = h0;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('canvas not available');
  ctx.drawImage(img, 0, 0);
  const px = ctx.getImageData(0, 0, w0, h0);
  const res = await runUpscaleWorker(px.data.buffer, w0, h0, stages, onProgress);
  const outCanvas = document.createElement('canvas');
  outCanvas.width = res.w; outCanvas.height = res.h;
  outCanvas.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(res.buf), res.w, res.h), 0, 0);
  const out = await new Promise((resolve, reject) =>
    outCanvas.toBlob((b) => (b ? resolve(b) : reject(new Error('upscale failed'))), 'image/png'));
  return { blob: out, w: res.w, h: res.h, scale: res.scale };
}
async function ensureVariant(asset, mode, onProgress) {
  asset.variants = asset.variants || {};
  if (asset.variants[mode]) return asset.variants[mode];
  const source = await ensureBlob(asset);
  const r = await upscaleBlob(source, mode, onProgress);
  asset.variants[mode] = { url: URL.createObjectURL(r.blob), blob: r.blob, w: r.w, h: r.h, size: r.blob.size, scale: r.scale };
  return asset.variants[mode];
}
/* Aktif görünüm: orijinal dosya ya da yükseltilmiş varyant */
function getView(asset) {
  const mode = asset.displayMode || 'original';
  const v = mode !== 'original' && asset.variants && asset.variants[mode];
  if (v) return { mode, url: v.url, blob: v.blob, w: v.w, h: v.h, ext: 'png', scale: v.scale };
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
/* Tek görseli (aktif mod + seçili format) indirilecek hale getirir */
async function exportAsset(key) {
  const asset = state.assets[key];
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
  return { blob: outBlob, filename: getSafeFilename(state.username, view.mode, ext, key) };
}
async function handleDownload() {
  const asset = state.assets[state.activeTab];
  if (!asset) return;
  downloadBtn.disabled = true;
  downloadBtn.dataset.busy = '1';
  const originalLabel = downloadBtn.textContent;
  downloadBtn.textContent = t().preparing;
  try {
    const { blob, filename } = await exportAsset(state.activeTab);
    triggerDownload(new Blob([blob], { type: 'application/octet-stream' }), filename);
    toast(t().toastDownloaded);
  } catch {
    toast(t().toastDownloadFailed, 'error');
  } finally {
    downloadBtn.disabled = false;
    delete downloadBtn.dataset.busy;
    downloadBtn.textContent = originalLabel;
  }
}

/* ---------- ZIP (store, sıkıştırmasız: görseller zaten sıkışık) ---------- */
let crcTable = null;
function crc32(bytes) {
  if (!crcTable) {
    crcTable = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      crcTable[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) crc = crcTable[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
async function buildZip(files) {
  const enc = new TextEncoder();
  const now = new Date();
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
  const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  const parts = [], central = [];
  let offset = 0;
  for (const f of files) {
    const data = new Uint8Array(await f.blob.arrayBuffer());
    const name = enc.encode(f.name);
    const crc = crc32(data);
    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true);
    lh.setUint16(8, 0, true); lh.setUint16(10, dosTime, true); lh.setUint16(12, dosDate, true);
    lh.setUint32(14, crc, true); lh.setUint32(18, data.length, true); lh.setUint32(22, data.length, true);
    lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
    parts.push(new Uint8Array(lh.buffer), name, data);
    const ch = new DataView(new ArrayBuffer(46));
    ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true);
    ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true); ch.setUint16(12, dosTime, true);
    ch.setUint16(14, dosDate, true); ch.setUint32(16, crc, true); ch.setUint32(20, data.length, true);
    ch.setUint32(24, data.length, true); ch.setUint16(28, name.length, true); ch.setUint32(42, offset, true);
    central.push(new Uint8Array(ch.buffer), name);
    offset += 30 + name.length + data.length;
  }
  const centralSize = central.reduce((n, c) => n + c.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
  end.setUint32(12, centralSize, true); end.setUint32(16, offset, true);
  return new Blob([...parts, ...central, new Uint8Array(end.buffer)], { type: 'application/zip' });
}
async function handleZip() {
  const keys = ['avatar', 'banner'].filter((k) => state.assets[k]);
  if (!keys.length) return;
  zipBtn.disabled = true;
  zipBtn.dataset.busy = '1';
  zipBtn.textContent = t().zipPreparing;
  try {
    const files = [];
    for (const k of keys) {
      const { blob, filename } = await exportAsset(k);
      files.push({ name: filename, blob });
    }
    const zip = await buildZip(files);
    triggerDownload(zip, `${getSafeFilename(state.username, 'original', 'zip', '').replace('-original', '')}`);
    toast(t().toastZip);
  } catch {
    toast(t().toastDownloadFailed, 'error');
  } finally {
    zipBtn.disabled = false;
    delete zipBtn.dataset.busy;
    zipBtn.textContent = t().zipBtn;
  }
}

/* ---------- Renk paleti (avatar'dan baskın renkler) ---------- */
async function extractPalette(blob, count = 5) {
  const img = await blobToImage(blob);
  const S = 56;
  const k = Math.min(1, S / Math.max(img.naturalWidth, img.naturalHeight));
  const cw = Math.max(1, Math.round(img.naturalWidth * k)), ch = Math.max(1, Math.round(img.naturalHeight * k));
  const c = document.createElement('canvas');
  c.width = cw; c.height = ch;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, cw, ch);
  const px = ctx.getImageData(0, 0, cw, ch).data;
  const buckets = new Map();
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] < 128) continue;
    const key = ((px[i] >> 4) << 8) | ((px[i + 1] >> 4) << 4) | (px[i + 2] >> 4);
    const b = buckets.get(key) || { n: 0, r: 0, g: 0, b: 0 };
    b.n++; b.r += px[i]; b.g += px[i + 1]; b.b += px[i + 2];
    buckets.set(key, b);
  }
  const sorted = [...buckets.values()].sort((a, b) => b.n - a.n)
    .map((b) => [Math.round(b.r / b.n), Math.round(b.g / b.n), Math.round(b.b / b.n)]);
  const picked = [];
  for (const col of sorted) {
    if (picked.every((p) => Math.hypot(p[0] - col[0], p[1] - col[1], p[2] - col[2]) > 52)) picked.push(col);
    if (picked.length >= count) break;
  }
  return picked.map(([r, g, b]) => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join(''));
}
async function renderPalette() {
  const key = state.activeTab;
  const asset = state.assets[key];
  paletteEl.hidden = true;
  if (!asset) return;
  try {
    if (!asset.palette) asset.palette = await extractPalette(await ensureBlob(asset));
    if (state.assets[state.activeTab] !== asset || !asset.palette.length) return;
    paletteEl.innerHTML = '';
    asset.palette.forEach((hex) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'swatch';
      b.style.background = hex;
      b.title = `${hex} — ${t().paletteTitle}`;
      b.setAttribute('aria-label', b.title);
      b.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(hex); toast(t().toastColorCopied(hex)); }
        catch { toast(t().toastCopyFailed, 'error'); }
      });
      paletteEl.appendChild(b);
    });
    paletteEl.hidden = false;
  } catch { paletteEl.hidden = true; }
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
  setTimeout(() => { if (!qrModal.classList.contains('open')) qrModal.hidden = true; }, 450);
}
qrImg.addEventListener('error', () => { qrImg.style.visibility = 'hidden'; });
qrImg.addEventListener('load', () => { qrImg.style.visibility = ''; });
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
  resultCard.setAttribute('data-kind', state.activeTab);
  if (asset.w && asset.h) previewFrame.style.setProperty('--ar', `${asset.w} / ${asset.h}`);
  else previewFrame.style.removeProperty('--ar');
  previewImg.alt = `@${state.username} — ${state.activeTab}`;
  previewImg.src = currentUrl;
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
  renderPalette();
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
    if (state.assets[state.activeTab] !== asset) return;
    const parts = [];
    if (meta.w && meta.h) parts.push(`${meta.w} × ${meta.h}px`);
    else parts.push(t().original);
    parts.push((meta.ext || 'WEBP').toUpperCase());
    if (meta.size) parts.push(formatBytes(meta.size));
    const html = parts.map(p => `<span>${p}</span>`).join('<span class="sep">·</span>');
    const mode = getView(asset).mode;
    const view = getView(asset);
    const base = (mode === 'strong' ? t().viewStrong : mode === 'clean' ? t().viewClean : t().viewOriginal).replace(/\s*×\d+/, '');
    const badgeText = mode === 'original' ? base : `${base} ×${view.scale || (mode === 'strong' ? 4 : 2)}`;
    resultSpecs.innerHTML = html + `<span class="sep">·</span><span class="badge">${badgeText}</span>`;
  } catch {
    resultSpecs.textContent = '';
  }
}

/* ---------- Lightbox ---------- */
function openLightbox(src) {
  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
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
    setTimeout(() => overlay.remove(), 450);
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
let runToken = 0;
async function run(rawInput) {
  const username = extractUsername(rawInput);
  if (!username) return;
  const token = ++runToken;
  const stale = () => token !== runToken;
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
      if (stale()) return;
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
      if (stale()) return;
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
        if (stale()) return;
        state.assets.banner = {
          url: bannerBest.url, w: bannerBest.w, h: bannerBest.h,
          isHighest: bannerBest.isHighest, ext: extFromUrl(bannerBest.url),
          size: null, blob: null, displayMode: 'original', variants: {},
        };
        resultTabs.hidden = false;
        zipBtn.hidden = false;
      } else {
        state.assets.banner = null;
        resultTabs.hidden = true;
        zipBtn.hidden = true;
      }

      state.activeTab = 'avatar';
      tabAvatar.classList.add('active');
      tabBanner.classList.remove('active');
      resultCard.setAttribute('data-kind', 'avatar');

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
      if (stale()) return;
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
      await ensureVariant(asset, nextMode, (p) => { btn.textContent = `${t().upscaling.replace('…', '')} ${Math.round(p * 100)}%`; });
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
zipBtn.addEventListener('click', handleZip);

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
  runToken++;
  updateUrl('');
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
    let u = usernameFromHash();
    if (!u) u = new URLSearchParams(location.search).get('u');
    if (u) { queryInput.value = u; run(u); }
  } catch {}
})();
/* Sayfa açıkken yeni bir paylaşım linki yapıştırılırsa / geri-ileri yapılırsa */
window.addEventListener('hashchange', () => {
  const u = usernameFromHash();
  if (u && u.toLowerCase() !== (state.username || '').toLowerCase()) { queryInput.value = u; run(u); }
});

/* PWA: sadece uygulama kabuğu için hafif service worker */
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
}

})();
