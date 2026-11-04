#!/usr/bin/env node
/* hdkicks build: kaynak dosyaları → /docs (GitHub Pages bu klasörden yayınlar).
   Kullanım: npm run build */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { minify: minifyJs } = require('terser');
const { minify: minifyHtml } = require('html-minifier-terser');
const { execSync } = require('child_process');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'docs');
const SITE = 'https://wek1d.github.io/hdkicks/';

const COPY_AS_IS = [
  'hdkic.png',
  'favicon-32.png',
  'favicon-48.png',
  'apple-touch-icon.png',
  'icon-192.png',
  'icon-512.png',
  'og-image.png',
  'manifest.webmanifest',
  'sw.js',
  'robots.txt',
  '.nojekyll',
];

function log(msg) { console.log(`[build] ${msg}`); }
const shortHash = (buf) => crypto.createHash('md5').update(buf).digest('hex').slice(0, 8);

function ensureOutDir() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
}

function copyAsIs() {
  for (const name of COPY_AS_IS) {
    const src = path.join(ROOT, name);
    if (!fs.existsSync(src)) { log(`atlandı (yok): ${name}`); continue; }
    fs.copyFileSync(src, path.join(OUT, name));
    log(`kopyalandı: ${name}`);
  }
  for (const f of fs.readdirSync(ROOT)) {
    if (/^google[0-9a-f]+\.html$/i.test(f)) {
      fs.copyFileSync(path.join(ROOT, f), path.join(OUT, f));
      log(`kopyalandı: ${f}`);
    }
  }
}

async function buildJs() {
  const src = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
  const result = await minifyJs(src, {
    compress: true,
    mangle: true,
    format: { comments: false },
  });
  if (result.error) throw result.error;
  fs.writeFileSync(path.join(OUT, 'app.js'), result.code);
  log(`app.js minify edildi (${src.length} → ${result.code.length} byte)`);
}

function buildCss() {
  const csso = execSync(`npx --no-install csso "${path.join(ROOT, 'style.css')}" --comments none`, {
    cwd: ROOT,
  }).toString();
  fs.writeFileSync(path.join(OUT, 'style.css'), csso);
  log(`style.css minify edildi`);
}

/* index.html: minify + style.css / app.js'e içerik hash'i ekle (?v=...) →
   deploy sonrası tarayıcı eski önbelleği kullanmaz. */
async function buildHtml() {
  let src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const v = (f) => shortHash(fs.readFileSync(path.join(OUT, f)));
  src = src
    .replace('href="style.css"', `href="style.css?v=${v('style.css')}"`)
    .replace('src="app.js"', `src="app.js?v=${v('app.js')}"`);
  const result = await minifyHtml(src, {
    collapseWhitespace: true,
    removeComments: true,
    minifyCSS: true,
    minifyJS: true,
    removeAttributeQuotes: false,
  });
  fs.writeFileSync(path.join(OUT, 'index.html'), result);
  log(`index.html minify edildi`);
}

/* lastmod: kaynak dosyaların GERÇEK son değişiklik tarihi (git commit, yoksa
   dosya mtime). Eskiden her build "bugün" yazıyordu; Google bunu güvenilmez sayar. */
function lastModified() {
  const files = ['index.html', 'app.js', 'style.css'];
  try {
    const out = execSync(`git log -1 --format=%cs -- ${files.join(' ')}`, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString().trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(out)) return out;
  } catch {}
  const t = Math.max(...files.map((f) => fs.statSync(path.join(ROOT, f)).mtimeMs));
  return new Date(t).toISOString().split('T')[0];
}

function buildSitemap() {
  const lastmod = lastModified();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;
  fs.writeFileSync(path.join(OUT, 'sitemap.xml'), xml);
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml); // kökteki kopya da güncel kalsın
  log(`sitemap.xml üretildi (lastmod: ${lastmod})`);
}

/* service worker önbelleği her deploy'da kendiliğinden yenilensin */
function stampServiceWorker() {
  const p = path.join(OUT, 'sw.js');
  if (!fs.existsSync(p)) return;
  const stamp = shortHash(fs.readFileSync(path.join(OUT, 'app.js')) + fs.readFileSync(path.join(OUT, 'style.css')));
  fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace("'hdkicks-shell-v1'", `'hdkicks-shell-${stamp}'`));
  log(`sw.js cache sürümü: ${stamp}`);
}

(async () => {
  try {
    ensureOutDir();
    copyAsIs();
    buildCss();
    await buildJs();
    await buildHtml();
    buildSitemap();
    stampServiceWorker();
    log('Bitti ✅  →  /docs güncellendi.');
  } catch (err) {
    console.error('[build] HATA:', err);
    process.exit(1);
  }
})();
