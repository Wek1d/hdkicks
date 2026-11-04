# hdkicks

Pulls a Kick channel's profile picture and banner at the highest resolution Kick's public API actually has — and lets you preview, convert, copy, share, or download them. Nothing resized, nothing re-encoded unless you ask for it.

Live at **[wek1d.github.io/hdkicks](https://wek1d.github.io/hdkicks/)**

---

## What it does

Paste a Kick username or a `kick.com/...` link, hit **Fetch**, and it resolves the channel through Kick's public channel endpoint. Before showing anything, it tries a short list of likely "un-resized" versions of the image URL (stripped resize query params, `fullsize-` / `original-` path variants) and keeps the one that actually loads with the largest pixel area. What you see and download is that file, not a scaled-down copy.

### Features

- **Highest-resolution avatar and banner** — picks the best variant by real image dimensions, not by URL guessing alone.
- **Avatar and banner** — switch tabs; banners are shown full-width in their real aspect ratio.
- **Download both as ZIP** — avatar + banner in one archive (store-only ZIP built in the browser, no library).
- **Color palette** — five dominant colors from the picture; click a swatch to copy its hex.
- **Channel info** — follower count (compact, e.g. `1,2 Mn`) and Kick's verified-streamer badge, shown next to the handle.
- **Upscale modes** — *Original* (untouched), *Clean ×2* (Lanczos only, colors untouched) and *Strong ×4* (staged Lanczos + luma-only, thresholded sharpening so skin and flat areas aren't amplified). All client-side, running in a Web Worker so the page never freezes. If the output would exceed 16 MP, the badge shows the scale that was actually applied.
- **Username fallback** — Kick slugs use `-` while usernames can contain `_`; if a name isn't found, the opposite separator is tried automatically.
- **Format conversion** — Original / PNG / JPEG / WEBP, done client-side with canvas (Firefox-safe: skips canvas if the blob already matches the target type).
- **Raw-byte downloads** — pulled as `Blob`, not re-encoded through canvas when "Original" is selected, so the saved file matches the source. PNG exports get descriptive metadata (title, source, software, project link) but no author or copyright claim.
- **Lightbox zoom** — click once to zoom at the clicked point, double-click for deeper zoom. On a mouse, hovering over a zoomed image pans it like a loupe.
- **Copy image** — copies the image to the clipboard as PNG.
- **Copy link** — copies a shareable `#u=username` deep link. The address bar is kept in sync with the current result, so refresh and bookmarks work.
- **Native share** — uses the Web Share API when available; falls back to sharing the image file, then to copying the link.
- **QR code** — generates a QR for the shareable link.
- **Open on Kick** — one click to open the channel's actual `kick.com/<username>` page in a new tab.
- **Keyboard shortcut** — press `/` anywhere (outside an input) to jump focus to the username field.
- **Recent history** — last 6 usernames, stored locally (localStorage).
- **Auto-parse** — pasting a full `https://kick.com/...` link auto-fills and fetches; a leading `@` is ignored.
- **Installable (PWA)** — web manifest + a small network-first service worker that caches only the app shell.
- **Auto theme + language** — follows `prefers-color-scheme`; defaults to Turkish or English from the browser language, with a manual switch.
- **Deep linkable** — opening `#u=username` (or the legacy `?u=username`) fetches that channel on load.

---

## How it works

1. **Resolve channel** — `https://kick.com/api/v2/channels/<username>`. Tries direct first; if blocked, falls back through a small proxy pool (corsproxy.io → allorigins → codetabs → thingproxy), remembering whichever works. Every request has a timeout, and a proxy that answers with something that isn't valid JSON is skipped in favor of the next one.
2. **Generate variants** — strips resize query params (`w`, `h`, `quality`, `fit`, `format`…), and swaps `-thumb/-small/-medium/-large` suffixes or prefixes for `fullsize-` / `original-` / no-prefix versions.
3. **Measure and pick** — loads every variant in parallel (max 4 at a time), reads `naturalWidth × naturalHeight`, picks the largest area that actually loads. If the URL is already a `-fullsize` / `-original` file, probing is skipped.
4. **Fetch as blob** — direct CORS fetch first, then through the proxy pool. Blob signature is validated (magic bytes for JPEG/PNG/GIF/WEBP/RIFF) before use, so an HTML error page from a proxy never gets mistaken for an image.
5. **Deliver** — the blob is re-wrapped locally and saved through an object URL with a proper `download` attribute, so cross-origin restrictions don't apply. Concurrent lookups are guarded: only the most recent search can update the page.

---

## Project structure

```
.
├── index.html                        # Markup + inline pre-paint theme/lang script
├── style.css                         # All styles, theming via CSS variables
├── app.js                            # All logic — i18n, fetching, variants, upscale worker, UI
├── build.js                          # Minifies the source into /docs, regenerates the sitemap
├── sw.js                             # Service worker (app shell only, network-first)
├── manifest.webmanifest              # PWA manifest
├── hdkic.png                         # Logo mark shown in the page header
├── favicon-32.png / favicon-48.png   # Favicons
├── apple-touch-icon.png              # iOS home-screen icon
├── icon-192.png / icon-512.png       # PWA icons
├── og-image.png                      # 1200×630 social preview
├── robots.txt                        # Crawler rules + sitemap pointer
├── sitemap.xml                       # Single-URL sitemap (auto-updated, see below)
├── google3509b483d0b14643.html       # Google Search Console verification (keep public)
├── .nojekyll                         # Tells GitHub Pages to skip Jekyll processing
├── .github/
│   ├── workflows/deploy.yml          # Weekly + on-push build; commits the refreshed sitemap
│   └── dependabot.yml                # Weekly npm updates, monthly Actions updates
├── docs/                             # Build output — this is what GitHub Pages serves
├── LICENSE                           # MIT
└── README.md
```

- **`.nojekyll`** — GitHub Pages runs Jekyll on branches by default; Jekyll ignores files starting with `_` and does extra processing. This empty file turns that off, so what you commit is what gets served.
- **`robots.txt` + `sitemap.xml`** — plain SEO plumbing. `lastmod` is taken from the git history of `index.html`, `app.js` and `style.css`, so it only moves when the site really changes (a build with no content change leaves it as is).
- **`google…html`** — Google Search Console verification. **Must stay public on the live site** — Google's crawler fetches it to confirm you own the domain. It contains no secret; deleting or hiding it will break verification.

---

## Build / deploy (docs is served, root is source)

The repo root holds the readable, commented source (`index.html`, `style.css`, `app.js`). A tiny Node script minifies everything and strips comments into `/docs`, and **GitHub Pages is configured to serve from `/docs`** — no separate branch or repo needed.

```bash
npm install     # one-time
npm run build   # every time you change index.html / style.css / app.js
git add .
git commit -m "..."
git push
```

`npm run build` regenerates `/docs` from scratch each time, so just edit the root files normally and run the build before pushing. Never hand-edit anything inside `/docs` — it gets wiped on the next build. The build also appends a content hash to `style.css` / `app.js` URLs (cache busting) and stamps the service worker cache name, so visitors get fresh files after every deploy.

### Automatic sitemap

`.github/workflows/deploy.yml` runs on every push to `main`, every Monday, and on demand. It builds the site and, if `sitemap.xml` changed, commits it back with `[skip ci]`. The checkout uses `fetch-depth: 0` on purpose: `lastmod` is read from git history, and a shallow clone would report the bot's own commit date instead of the real last change. Note the workflow only commits the sitemap — the rest of `/docs` is whatever you built and pushed yourself.

One-time GitHub setup: **Settings → Pages → Branch: `main` / Folder: `/docs`**.

## Running it locally

```bash
git clone https://github.com/Wek1d/hdkicks.git
cd hdkicks
python3 -m http.server 8000
```

Then open `http://localhost:8000` (the source files run as-is; the build only minifies). To test the minified output, run `npm run build` and serve `/docs` instead.

---

## Tech stack

- **Vanilla JavaScript** — no framework, no bundler. A small Node script (`terser`, `csso`, `html-minifier-terser`) only minifies the source.
- **Single-page logic** — everything lives in `index.html`, `style.css`, and `app.js` (plus a tiny service worker).
- **Hosting** — GitHub Pages.
- **Fonts** — Inter + JetBrains Mono via Google Fonts (with `preconnect`).
- **No backend** — all requests go straight from the browser to Kick (or through a public CORS proxy when direct is blocked).

---

## Privacy

- No analytics, no trackers, no cookies, no accounts, no server of our own.
- When Kick blocks direct access, channel and image requests go through public CORS proxies, which can see which username you looked up.
- The service worker caches only this site's own files (app shell), never Kick data or images.
- The only persistent storage is `localStorage`, and only for your preferences and recent lookups:
  - `hdkicks-lang`, `hdkicks-theme`, `hdkicks:format` — UI preferences.
  - `hdkicks:history` — last 6 usernames you fetched.
  - `hdkicks:proxy` — which CORS proxy last worked, so it's tried first next time.
- Clearing your browser storage for this site wipes all of it.

---

## Browser support

Tested on current Chrome, Edge, Firefox, and Safari (desktop + mobile). Two known quirks:

- **Firefox** may open a preview tab alongside the download for some image types (especially WebP). The file still lands on disk with the correct name and bytes — this is Firefox's own preview behaviour and can't be reliably suppressed from the page.
- **Download across origins**: some browsers ignore the `download` attribute for cross-origin resources. When that happens, the image opens in a new tab instead of forcing a failed save.

---

## FAQ

**Why does the download sometimes open in a new tab?**
Because browsers won't honour a forced `download` for a cross-origin blob in every case. Rather than yanking you off the page with a broken save, it opens the image so you can save it manually.

**Is the image always the "real" highest resolution?**
It's the highest one Kick's public CDN actually serves for that channel. If Kick only uploaded a 512×512 avatar, that's the ceiling — hdkicks won't upscale.

**Why the proxy pool?**
Kick's API doesn't send permissive CORS headers to every origin, so a browser can't always reach it directly. The proxy list is a fallback chain; whichever one works is remembered locally.

**Does it add a copyright notice to the images I download?**
No. Exported PNGs carry neutral metadata (title, source, software, link to this project) — no author or copyright field.

**Will a Kick API change break this?**
Probably yes, until it's patched. Both the channel JSON shape and CDN URL conventions are assumed. See *Notes*.

---

## Contributing

Issues and PRs are welcome. If you're fixing a URL-variant or API-shape breakage, please include the failing channel name and what the browser console showed, so the fix can be verified against the same input.

---

## Notes

- This project reads only what Kick already exposes publicly on any channel page. It isn't affiliated with Kick in any way.
- Because it depends on Kick's API shape and CDN URL conventions staying roughly the same, it may need small fixes if Kick changes either.
- The `google…html` file must remain publicly reachable on the deployed site — it's how Search Console verifies ownership. It contains no secret.
- Licensed under MIT — see [`LICENSE`](LICENSE). © 2026 Arda Keçeci ([Wek1d](https://github.com/Wek1d)).