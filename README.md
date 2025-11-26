# Web Scraper Collection

A collection of powerful web scraping tools for various platforms including Pinterest, Spotify, WormGPT AI, NanoBanana image editor, and proxy services.

> **Created by:** [Affan Khulafa Hidayah](https://akhfhid.my.id)

---

## Installation

First, clone this repository and install dependencies:

```bash
git clone https://github.com/akhfhid/Scrape.git
cd Scrape
npm install axios form-data file-type
```

---

## Scrapers Overview

### 1. Pinterest Scraper

Download images and videos from Pinterest URLs.

**Usage:**

```javascript
const pinterest = require('./pinterest.js');

async function run() {
  const result = await pinterest('https://pin.it/yourPinUrl');
  console.log(result);
}

run();
```

**Response:**

```json
{
  "type": "video",
  "title": "Art",
  "author": "Akhfhid",
  "username": "Akhfhid",
  "media": "https://v1.pinimg.com/videos/..."
}
```

---

### 2. Spotify Downloader

Download music from Spotify with metadata.

**Usage:**

```javascript
const spotify = require('./spotify-play.js');

async function run() {
  const result = await spotify('https://open.spotify.com/track/yourTrackId');
  console.log(result);
}

run();
```

**Response:**

```json
{
  "metadata": {
    "title": "Song Title",
    "artist": "Artist Name",
    "duration": "3:45",
    "cover": "https://...",
    "url": "https://open.spotify.com/track/..."
  },
  "audio": "<Buffer...>"
}
```

---

### 3. WormGPT AI

AI chatbot integration (requires OpenRouter API key).

**Setup:**

1. Get your API key from [OpenRouter](https://openrouter.ai)
2. Replace `KEY_LU` with your actual API key in `worm-gpt.js`

**Usage:**

```javascript
const wormGpt = require('./worm-gpt.js');

// Inside your bot command handler:
await wormGpt(m, conn, command, text);
```

**Note:** This requires integration with a messaging bot framework (Discord, Telegram, etc.)

---

### 4. NanoBanana Image Editor

AI-powered image editing with prompts.

**Usage:**

```javascript
const { GridPlus } = require('./nanobanana.js');
const fs = require('fs');

async function editImage() {
  const grid = new GridPlus();
  const imageBuffer = fs.readFileSync('input.jpg');
  const result = await grid.edit(imageBuffer, 'make it cyberpunk style');
  console.log('Result URL:', result);
}

editImage();
```

---

### 5. ProxyFilter

Fetch web content through ProxyFilter servers.

**Usage:**

```javascript
const { fetchViaProxy } = require('./proxysite.js');

async function fetchData() {
  const html = await fetchViaProxy('https://example.com', 'us', 1);
  console.log(html);
}

fetchData();
```

**Parameters:**

- `url`: Target website URL
- `region`: Server region (`us` or `eu`)
- `srvNum`: Server number (1-20)

---

## Requirements

- Node.js 14+
- Dependencies:
  - `axios`
  - `form-data`
  - `file-type`
  - `node:crypto` (built-in)

---

## Configuration

### WormGPT

Edit the API key in `worm-gpt.js`:

```javascript
const api_key = "YOUR_API_KEY_HERE"
```

### ProxyFilter

Choose region and server:

- **US Servers:** `us1` to `us20`
- **EU Servers:** `eu1` to `eu20`

---

## Testing

Each scraper includes example code at the bottom of the file. Simply run:

```bash
node pinterest.js
node spotify-play.js
node nanobanana.js
node proxysite.js
```

---

## Disclaimer

These tools are for educational purposes only. Please respect:

- Website Terms of Service
- Copyright laws
- API rate limits
- Robot.txt files

Always ensure you have permission to scrape content.

---

## Author

**Affan Khulafa Hidayah**

- Website: [https://akhfhid.my.id](https://akhfhid.my.id)
- GitHub: [@akhfhid](https://github.com/akhfhid)

---

## Contributing

Contributions, issues, and feature requests are welcome!

---

## Show Your Support

Give a Star  if this project helped you!
