# hdkicks 🟢

Fetch and download any Kick.com profile picture in its **highest uncompressed resolution**.

🔗 **Live:** [wek1d.github.io/hdkicks](https://wek1d.github.io/hdkicks/)

---

## Features

- 🎯 **Full Resolution:** Strips CDN compression and query params to retrieve the original uploaded avatar.
- ⚡ **Zero Dependencies:** Pure HTML, CSS, and Vanilla JS in a single `index.html` file.
- 🔍 **Built-in Lightbox:** Zoom and inspect avatars in full size before downloading.
- 🌐 **Auto & Manual i18n:** Supports Turkish and English automatically based on browser settings.
- 🌗 **Theme Support:** Dark and Light mode integrated with native system preferences.
- 📦 **Direct Blob Download:** Bypasses browser navigation and saves the actual image file directly.

---

## How It Works

1. **URL Parsing:** Extracts raw usernames from full channel links (`kick.com/username`) or plain handles.
2. **API Fetch:** Queries Kick's public channel endpoints (`/api/v2/channels/{username}`). Fallback proxies are used seamlessly if CORS constraints occur.
3. **Quality Optimization:** Tests CDN paths to guarantee the original source file instead of downscaled thumbnails.
4. **Direct Delivery:** Converts the image buffer into a blob for instant, one-click downloading.

> *Disclaimer: hdkicks is an independent, open-source tool and is not affiliated with, endorsed by, or connected to Kick.com.*

---

## Quick Start

No build tools or node packages required.

```bash
git clone [https://github.com/Wek1d/hdkicks.git](https://github.com/Wek1d/hdkicks.git)
cd hdkicks
# Open index.html directly in your browser or run a local server:
python3 -m http.server 8000