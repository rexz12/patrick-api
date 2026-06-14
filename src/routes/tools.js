import { Router } from "express";
import axios from "axios";
import { success, error, isValidUrl } from "../middleware/response.js";

const router = Router();

// ── SCREENSHOT WEBSITE ────────────────────────────────────────
/**
 * GET /api/ssweb?url=https://example.com
 * Screenshot sebuah website, return URL gambar
 */
router.get("/ssweb", async (req, res) => {
  const { url } = req.query;
  if (!url) return error(res, "Parameter 'url' wajib diisi", 400);
  if (!isValidUrl(url)) return error(res, "URL tidak valid", 400);

  try {
    // Gunakan screenshotapi gratis
    const ssUrl = `https://api.screenshotmachine.com/?key=demo&url=${encodeURIComponent(url)}&device=desktop&dimension=1366x768&format=png&cacheLimit=0`;
    // Alternatif publik
    const result = `https://image.thum.io/get/width/1280/crop/900/noanimate/${encodeURIComponent(url)}`;
    return success(res, { url: result, website: url }, "Berhasil membuat screenshot");
  } catch (e) {
    return error(res, e.message || "Gagal screenshot website");
  }
});

// ── REMOVE BACKGROUND ────────────────────────────────────────
/**
 * GET /api/remobg?url=https://example.com/image.jpg
 * Hapus background gambar, return URL gambar tanpa background
 */
router.get("/remobg", async (req, res) => {
  const { url } = req.query;
  if (!url) return error(res, "Parameter 'url' wajib diisi", 400);
  if (!isValidUrl(url)) return error(res, "URL gambar tidak valid", 400);

  try {
    const { data } = await axios.get(
      `https://api.remove.bg/v1.0/removebg`,
      {
        params: { image_url: url, size: "auto" },
        headers: { "X-Api-Key": process.env.REMOVEBG_KEY || "demo" },
        responseType: "arraybuffer",
        timeout: 30000,
      }
    );
    // Return via imgbb jika ada key, atau fallback ke remove.bg demo
    const base64 = Buffer.from(data).toString("base64");
    return success(res, {
      base64: `data:image/png;base64,${base64}`,
      note: "Gunakan REMOVEBG_KEY di .env untuk kualitas lebih baik",
    }, "Berhasil remove background");
  } catch {
    // Fallback: api gratis alternatif
    try {
      const { data } = await axios.post(
        "https://api.remove.bg/v1.0/removebg",
        { image_url: url, size: "preview" },
        {
          headers: {
            "X-Api-Key": "demo",
            "Content-Type": "application/json",
          },
          timeout: 20000,
        }
      );
      return success(res, data, "Berhasil remove background");
    } catch (e2) {
      return error(res, "Gagal remove background. Set REMOVEBG_KEY di .env");
    }
  }
});

// ── QR CODE GENERATOR ────────────────────────────────────────
/**
 * GET /api/qr?text=HelloWorld
 * Generate QR Code, return URL gambar QR
 */
router.get("/qr", async (req, res) => {
  const { text, size = 300, color = "000000", bg = "ffffff" } = req.query;
  if (!text) return error(res, "Parameter 'text' wajib diisi", 400);

  try {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(text)}&size=${size}x${size}&color=${color}&bgcolor=${bg}&format=png`;
    return success(res, {
      url: qrUrl,
      text,
      size: `${size}x${size}`,
    }, "Berhasil generate QR Code");
  } catch (e) {
    return error(res, "Gagal generate QR Code");
  }
});

// ── IP INFO ──────────────────────────────────────────────────
/**
 * GET /api/ipinfo?ip=8.8.8.8
 * Cek informasi IP address
 */
router.get("/ipinfo", async (req, res) => {
  const { ip } = req.query;
  const target = ip || req.ip;

  try {
    const { data } = await axios.get(`https://ipapi.co/${target}/json/`, {
      timeout: 10000,
    });
    if (data.error) return error(res, data.reason || "IP tidak valid", 400);
    return success(res, {
      ip: data.ip,
      city: data.city,
      region: data.region,
      country: data.country_name,
      country_code: data.country_code,
      postal: data.postal,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
      isp: data.org,
      asn: data.asn,
    }, "Berhasil mengambil info IP");
  } catch (e) {
    return error(res, "Gagal mengambil info IP");
  }
});

// ── TEMP MAIL ────────────────────────────────────────────────
/**
 * GET /api/tempmail
 * Generate email sementara (disposable email)
 */
router.get("/tempmail", async (req, res) => {
  try {
    // Buat email random di guerrillamail
    const { data } = await axios.get("https://api.guerrillamail.com/ajax.php?f=get_email_address", {
      timeout: 10000,
    });
    return success(res, {
      email: data.email_addr,
      token: data.sid_token,
      expires: "1 jam",
      check_inbox: `/api/tempmail/inbox?token=${data.sid_token}`,
    }, "Email sementara berhasil dibuat");
  } catch (e) {
    return error(res, "Gagal membuat email sementara");
  }
});

/**
 * GET /api/tempmail/inbox?token=xxx
 * Cek inbox email sementara
 */
router.get("/tempmail/inbox", async (req, res) => {
  const { token } = req.query;
  if (!token) return error(res, "Parameter 'token' wajib diisi", 400);

  try {
    const { data } = await axios.get(
      `https://api.guerrillamail.com/ajax.php?f=get_email_list&offset=0&sid_token=${token}`,
      { timeout: 10000 }
    );
    const emails = (data.list || []).map(m => ({
      id: m.mail_id,
      from: m.mail_from,
      subject: m.mail_subject,
      date: m.mail_date,
      read: m.mail_read === "1",
    }));
    return success(res, { count: emails.length, emails }, "Berhasil mengambil inbox");
  } catch (e) {
    return error(res, "Gagal mengambil inbox");
  }
});

// ── WEATHER ──────────────────────────────────────────────────
/**
 * GET /api/weather?city=Jakarta
 * Cek cuaca suatu kota
 */
router.get("/weather", async (req, res) => {
  const { city } = req.query;
  if (!city) return error(res, "Parameter 'city' wajib diisi. Contoh: /api/weather?city=Jakarta", 400);

  try {
    const { data } = await axios.get(
      `https://wttr.in/${encodeURIComponent(city)}?format=j1`,
      { timeout: 10000 }
    );
    const current = data.current_condition?.[0];
    const nearest = data.nearest_area?.[0];
    return success(res, {
      location: {
        city: nearest?.areaName?.[0]?.value || city,
        region: nearest?.region?.[0]?.value || "",
        country: nearest?.country?.[0]?.value || "",
      },
      weather: {
        temp_c: current?.temp_C,
        temp_f: current?.temp_F,
        feels_like_c: current?.FeelsLikeC,
        humidity: current?.humidity + "%",
        wind_speed: current?.windspeedKmph + " km/h",
        wind_dir: current?.winddir16Point,
        description: current?.weatherDesc?.[0]?.value,
        visibility: current?.visibility + " km",
        uv_index: current?.uvIndex,
      },
    }, `Cuaca di ${city}`);
  } catch (e) {
    return error(res, "Gagal mengambil data cuaca. Pastikan nama kota benar");
  }
});

// ── TRANSLATE ────────────────────────────────────────────────
/**
 * GET /api/translate?text=Hello&to=id
 * Terjemahkan teks ke bahasa tertentu
 */
router.get("/translate", async (req, res) => {
  const { text, to = "id", from = "auto" } = req.query;
  if (!text) return error(res, "Parameter 'text' wajib diisi", 400);

  try {
    const { data } = await axios.get(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`,
      { timeout: 10000 }
    );
    const translated = data[0]?.map(t => t[0]).join("") || "";
    const detected = data[2] || from;
    return success(res, {
      original: text,
      translated,
      from: detected,
      to,
    }, "Berhasil menerjemahkan");
  } catch (e) {
    return error(res, "Gagal menerjemahkan teks");
  }
});

// ── RANDOM QUOTE ─────────────────────────────────────────────
/**
 * GET /api/quote
 * Ambil quote motivasi random
 */
router.get("/quote", async (req, res) => {
  try {
    const { data } = await axios.get("https://api.quotable.io/random", { timeout: 10000 });
    return success(res, {
      quote: data.content,
      author: data.author,
      tags: data.tags,
    }, "Berhasil mengambil quote");
  } catch {
    // Fallback quotes
    const quotes = [
      { quote: "Belajarlah dari kemarin, hiduplah untuk hari ini, berharaplah untuk hari esok.", author: "Albert Einstein" },
      { quote: "Kesuksesan adalah hasil dari persiapan, kerja keras, dan belajar dari kegagalan.", author: "Colin Powell" },
      { quote: "Jangan berhenti ketika lelah, berhentilah ketika selesai.", author: "Unknown" },
    ];
    return success(res, quotes[Math.floor(Math.random() * quotes.length)], "Berhasil mengambil quote");
  }
});

export default router;
