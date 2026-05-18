#  Scrape

**Kumpulan script scraping dan otomatisasi untuk berbagai kebutuhan.**

---

##  Tentang Repository

Repository ini berisi berbagai **script JavaScript** untuk:

- **Web scraping** (anime, Pinterest, dll.)
- **Otomasi tugas** (blur wajah, hapus background, dll.)
- **Integrasi AI** (Chat AI, Claude, dll.)
- **Konversi format** (Web ke APK, dll.)

---

##  Daftar Script

###  Anime & Streaming


| Script                                                                     | Deskripsi                      |
| -------------------------------------------------------------------------- | ------------------------------ |
| `[animeku.js](https://github.com/akhfhid/Scrape/blob/main/animeku.js)`     | Scraper untuk situs Animeku.   |
| `[otakudesu.js](https://github.com/akhfhid/Scrape/blob/main/otakudesu.js)` | Scraper untuk situs Otakudesu. |


###  AI & Chatbot


| Script                                                                   | Deskripsi                                          |
| ------------------------------------------------------------------------ | -------------------------------------------------- |
| `[chatai.js](https://github.com/akhfhid/Scrape/blob/main/chatai.js)`     | Scraper untuk DeepSeek Chat (support multi-model). |
| `[claude.js](https://github.com/akhfhid/Scrape/blob/main/claude.js)`     | Integrasi dengan Claude AI.                        |
| `[worm-gpt.js](https://github.com/akhfhid/Scrape/blob/main/worm-gpt.js)` | Script terkait WormGPT.                            |
| `[zai.js](https://github.com/akhfhid/Scrape/blob/main/zai.js)`           | Script AI dengan nama "Zai".                       |


###  Pengolahan Gambar


| Script                                                                     | Deskripsi                         |
| -------------------------------------------------------------------------- | --------------------------------- |
| `[blur-face.js](https://github.com/akhfhid/Scrape/blob/main/blur-face.js)` | Blur wajah dalam gambar.          |
| `[removebg.js](https://github.com/akhfhid/Scrape/blob/main/removebg.js)`   | Hapus background gambar.          |
| `[test-blur.js](https://github.com/akhfhid/Scrape/blob/main/test-blur.js)` | Test script untuk `blur-face.js`. |


###  Penelitian & Data


| Script                                                                     | Deskripsi                          |
| -------------------------------------------------------------------------- | ---------------------------------- |
| `[research.js](https://github.com/akhfhid/Scrape/blob/main/research.js)`   | Script untuk riset/ekstraksi data. |
| `[pinterest.js](https://github.com/akhfhid/Scrape/blob/main/pinterest.js)` | Scraper untuk Pinterest.           |


###  Multimedia


| Script                                                                           | Deskripsi              |
| -------------------------------------------------------------------------------- | ---------------------- |
| `[spotify-play.js](https://github.com/akhfhid/Scrape/blob/main/spotify-play.js)` | Putar lagu di Spotify. |


###  Lainnya


| Script                                                                             | Deskripsi                      |
| ---------------------------------------------------------------------------------- | ------------------------------ |
| `[nanobanana.js](https://github.com/akhfhid/Scrape/blob/main/nanobanana.js)`       | Script scraping (versi 1).     |
| `[nanobanana2.js](https://github.com/akhfhid/Scrape/blob/main/nanobanana2.js)`     | Script scraping (versi 2).     |
| `[nanobananapro.js](https://github.com/akhfhid/Scrape/blob/main/nanobananapro.js)` | Script scraping (versi pro).   |
| `[web2apk.js](https://github.com/akhfhid/Scrape/blob/main/web2apk.js)`             | Konversi web ke APK.           |
| `[proxysite.js](https://github.com/akhfhid/Scrape/blob/main/proxysite.js)`         | Handling proxy untuk scraping. |


---

##  Cara Menggunakan

### 1. Clone Repository

```bash
git clone https://github.com/akhfhid/Scrape.git
cd Scrape
```

### 2. Install Dependensi

```bash
npm install
```

*(Pastikan `package.json` sudah terisi dengan benar.)*

### 3. Jalankan Script

Contoh untuk menjalankan `chatai.js`:

```javascript
const { chatai, listModels } = require('./chatai.js');

// Contoh penggunaan
chatai({
  input: "Hai, apa kabar?",
  model: "deepseek-v3" // Lihat daftar model di `listModels`
}).then(console.log).catch(console.error);
```

---

##  Dependensi Utama

- `axios`: Untuk HTTP requests.
- `form-data`: Untuk handling form data (misal: upload file).
- `cheerio` (jika diperlukan): Untuk parsing HTML.

---

##  Kontribusi

Kontribusi sangat welcome! Buka **Pull Request** atau **Issue** jika ada:

- Bug
- Fitur baru
- Peningkatan kode

---

##  Lisensi

Repository ini menggunakan lisensi **[MIT](https://github.com/akhfhid/Scrape/blob/main/LICENSE)**.

---

##  Kontak

- **Author**: [akhfhid](https://github.com/akhfhid)
- **Repository**: [akhfhid/Scrape](https://github.com/akhfhid/Scrape)
