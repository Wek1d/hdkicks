#!/usr/bin/env node
/**
 * build.js
 * Kök dizindeki kaynak dosyaları okur, JS/CSS/HTML'i minify + yorumsuz
 * hale getirip /docs klasörüne yazar. GitHub Pages Settings'te
 * "Branch: main /docs" seçili olduğu sürece deploy için bu klasör kullanılır.
 *
 * Kullanım:  npm run build
 */
const fs = require('fs');
const path = require('path');
const { minify: minifyJs } = require('terser');
const { minify: minifyHtml } = require('html-minifier-terser');
const { execSync } = require('child_process');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'docs');

// Doğrudan kopyalanacak (minify gerektirmeyen) dosya/klasörler
const COPY_AS_IS = [
  'icon.png',
  'robots.txt',
  'sitemap.xml',
  '.nojekyll',
];

function log(msg) { console.log(`[build] ${msg}`); }

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
  // Google Search Console doğrulama dosyası (adı değişken, google*.html)
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

async function buildHtml() {
  const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const result = await minifyHtml(src, {
    collapseWhitespace: true,
    removeComments: true,
    minifyCSS: true,
    minifyJS: false, // app.js zaten ayrı minify ediliyor, inline script'i bozmasın
    removeAttributeQuotes: false,
  });
  fs.writeFileSync(path.join(OUT, 'index.html'), result);
  log(`index.html minify edildi`);
}

(async () => {
  try {
    ensureOutDir();
    copyAsIs();
    await buildCss();
    await buildJs();
    await buildHtml();
    log('Bitti ✅  →  /docs güncellendi. Şimdi commit + push yapabilirsin.');
  } catch (err) {
    console.error('[build] HATA:', err);
    process.exit(1);
  }
})();