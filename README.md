# hdkicks

Pulls a Kick channel's profile picture at the highest resolution Kick's public API actually has, and lets you preview or download it — nothing resized, nothing re-encoded.

Live at [wek1d.github.io/hdkicks](https://wek1d.github.io/hdkicks/).

## What it does

Paste a Kick username or a `kick.com/...` link, hit Fetch, and it resolves the channel's avatar through Kick's public channel endpoint. Before showing anything, it tries a short list of likely "un-resized" versions of that image URL (stripped resize query params, `fullsize-`/`original-` path variants) and keeps the first one that actually loads. What you see and download is that file, not a scaled-down copy.

Click the preview once to zoom in on the spot you clicked; double-click for a closer zoom. On a mouse, moving over a zoomed image pans it around like a loupe. Downloads are pulled as raw bytes rather than a canvas re-encode, so the saved file matches the source exactly — if a cross-origin fetch can't be forced into a download (some browsers won't respect the `download` attribute across origins), it opens the image in a new tab instead of yanking you off the page.

The whole thing is one HTML file — no framework, no build step, no server component beyond GitHub Pages. It follows your system's light/dark preference and switches live if you change it, and it defaults to Turkish or English based on your browser language (with a manual switch if it guesses wrong).

## Running it locally

```bash
git clone https://github.com/Wek1d/hdkicks.git
cd hdkicks
python3 -m http.server 8000
```

Or just open `index.html` directly in a browser.

## Notes

- This project reads only what Kick already exposes publicly on any channel page. It isn't affiliated with Kick in any way.
- Because it depends on Kick's API shape and CDN URL conventions staying roughly the same, it may need small fixes if Kick changes either.
- Licensed under MIT — see [`LICENSE`](LICENSE). © 2026 Arda Keçeci ([Wek1d](https://github.com/Wek1d)).

---

## Türkçe

Bir Kick kanalının profil görselini, Kick'in genel API'sinin sunduğu en yüksek çözünürlükte çeker; önizleyebilir ya da indirebilirsiniz — ne yeniden boyutlandırma ne de yeniden kodlama yapılır.

Canlı adres: [wek1d.github.io/hdkicks](https://wek1d.github.io/hdkicks/)

### Ne yapıyor

Bir Kick kullanıcı adı veya `kick.com/...` linki yapıştırıp Çek'e basınca, kanalın profil görselini Kick'in genel kanal uç noktası üzerinden çözer. Herhangi bir şey göstermeden önce, o görsel linkinin olası "ölçeklenmemiş" birkaç varyantını dener (boyutlandırma sorgu parametreleri atılmış, `fullsize-`/`original-` yol varyantları) ve gerçekten yüklenen ilkini kullanır. Gördüğünüz ve indirdiğiniz dosya, küçültülmüş bir kopya değil tam olarak budur.

Önizlemeye bir kez tıklamak, tıkladığınız noktaya odaklanarak yakınlaştırır; çift tıklamak daha fazla yakınlaştırır. Fare kullanıyorsanız, yakınlaştırılmış görselin üzerinde gezinmek onu bir büyüteç gibi kaydırır. İndirmeler ham bayt olarak çekilir, canvas üzerinden yeniden kodlanmaz — bu yüzden kaydedilen dosya kaynağıyla birebir aynıdır. Farklı kaynaklı bir isteğin indirmeye zorlanamadığı durumlarda (bazı tarayıcılar `download` özniteliğine farklı kaynaklarda uymaz), sizi araçtan koparmak yerine görseli yeni bir sekmede açar.

Tamamı tek bir HTML dosyası — framework yok, derleme adımı yok, GitHub Pages dışında bir sunucu bileşeni yok. Sisteminizin açık/koyu tema tercihini izler ve siz değiştirdiğinizde anlık günceller; tarayıcı dilinize göre varsayılan olarak Türkçe veya İngilizce açılır, yanlış tahmin ederse elle değiştirme seçeneği vardır.

### Yerelde çalıştırma

```bash
git clone https://github.com/Wek1d/hdkicks.git
cd hdkicks
python3 -m http.server 8000
```

Ya da `index.html` dosyasını doğrudan tarayıcıda açabilirsiniz.

### Notlar

- Bu proje yalnızca Kick'in her kanal sayfasında zaten herkese açık olarak sunduğu veriyi okur. Kick ile hiçbir şekilde bağlantılı değildir.
- Kick'in API yapısına ve CDN URL kurallarına bağlı olduğundan, Kick bunlardan birini değiştirirse küçük düzeltmelere ihtiyaç duyabilir.
- MIT lisansı ile dağıtılmaktadır — ayrıntılar için [`LICENSE`](LICENSE) dosyasına bakın. © 2026 Arda Keçeci ([Wek1d](https://github.com/Wek1d)).