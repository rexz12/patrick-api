<div align="center">

# 🚀 Patrick API

**REST API publik gratis — Downloader, AI, Tools**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?style=flat-square&logo=node.js)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-black?style=flat-square&logo=express)](https://expressjs.com)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

</div>

---

## 📦 Endpoints

### 📥 Downloader

| Endpoint | Parameter | Deskripsi |
|----------|-----------|-----------|
| `GET /api/tiktok` | `url` | Download video/slide TikTok tanpa watermark |
| `GET /api/ytmp3` | `url` | Download audio YouTube (MP3) |
| `GET /api/ytmp4` | `url` | Download video YouTube (MP4) |
| `GET /api/ytsearch` | `q` | Cari video di YouTube |
| `GET /api/instagram` | `url` | Download foto/video Instagram |
| `GET /api/twitter` | `url` | Download media Twitter/X |
| `GET /api/facebook` | `url` | Download video Facebook |
| `GET /api/spotify` | `url` | Download lagu Spotify |

### 🔧 Tools

| Endpoint | Parameter | Deskripsi |
|----------|-----------|-----------|
| `GET /api/ssweb` | `url` | Screenshot website |
| `GET /api/qr` | `text`, `size`, `color` | Generate QR Code |
| `GET /api/ipinfo` | `ip` | Info IP address |
| `GET /api/tempmail` | - | Generate email sementara |
| `GET /api/tempmail/inbox` | `token` | Cek inbox temp mail |
| `GET /api/weather` | `city` | Cek cuaca kota |
| `GET /api/translate` | `text`, `to`, `from` | Terjemahkan teks |
| `GET /api/quote` | - | Quote motivasi random |

### 🧠 AI

| Endpoint | Parameter | Deskripsi |
|----------|-----------|-----------|
| `GET /api/ai` | `text` | Chat dengan AI |
| `POST /api/ai` | `messages[]`, `system` | Chat AI dengan history |
| `GET /api/img2prompt` | `url` | Analisis gambar → prompt |
| `GET /api/txt2img` | `text`, `model`, `width`, `height` | Generate gambar dari teks |

---

## 🚀 Instalasi

```bash
git clone https://github.com/rexz12/patrick-api.git
cd patrick-api
npm install
cp .env.example .env
npm start
```

Server berjalan di `http://localhost:3000`

---

## 📖 Contoh Penggunaan

### Download TikTok
```bash
curl "http://localhost:3000/api/tiktok?url=https://vt.tiktok.com/xxx"
```

```json
{
  "status": true,
  "code": 200,
  "message": "Berhasil mengambil data TikTok",
  "result": {
    "title": "Judul video...",
    "author": { "username": "user123" },
    "downloads": [
      { "type": "nowatermark", "url": "https://..." },
      { "type": "nowatermark_hd", "url": "https://..." }
    ],
    "stats": { "views": "1.000.000", "likes": "50.000" }
  }
}
```

### AI Chat
```bash
curl "http://localhost:3000/api/ai?text=Halo, siapa kamu?"
```

### Generate QR Code
```bash
curl "http://localhost:3000/api/qr?text=https://github.com/rexz12&size=400"
```

### Cek Cuaca
```bash
curl "http://localhost:3000/api/weather?city=Jakarta"
```

### Terjemahkan Teks
```bash
curl "http://localhost:3000/api/translate?text=Hello World&to=id"
```

---

## ⚙️ Konfigurasi

Edit file `.env`:

```env
PORT=3000
REMOVEBG_KEY=   # Opsional, dari remove.bg
OPENAI_KEY=     # Opsional
```

---

## 🖥️ Deploy

### Railway / Render
1. Fork repo ini
2. Connect ke Railway/Render
3. Set environment variables
4. Deploy!

### VPS / Pterodactyl
```bash
npm start
```
Startup command: `npm start`  
Node.js: 18+

---

## 📊 Rate Limit

- **60 request/menit** per IP
- Response 429 jika melebihi limit

---

## 👤 Author

**rexz12** — [GitHub](https://github.com/rexz12)

> API ini bagian dari ekosistem [Patrick AI WhatsApp Bot](https://github.com/rexz12/patrick-ai-whatsapp-bot)
