import { Router } from "express";
import axios from "axios";
import { success, error, isValidUrl } from "../middleware/response.js";

const router = Router();

// ── AI CHAT ──────────────────────────────────────────────────
/**
 * GET /api/ai?text=Halo siapa kamu?
 * Chat dengan AI (GPT-4 free via api publik)
 */
router.get("/ai", async (req, res) => {
  const { text, model = "gpt4" } = req.query;
  if (!text) return error(res, "Parameter 'text' wajib diisi. Contoh: /api/ai?text=Halo", 400);

  try {
    // Primary: ai4chat free
    const { data } = await axios.post(
      "https://www.ai4chat.co/generate-response",
      { messages: [{ role: "user", content: text }] },
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0",
          "Referer": "https://www.ai4chat.co/",
        },
        timeout: 30000,
      }
    );
    const reply = data?.message || data?.response || data?.text;
    if (reply) return success(res, { reply, model: "GPT-4" }, "Berhasil mendapat respons AI");
    throw new Error("Response kosong");
  } catch {
    // Fallback: pollinations
    try {
      const { data } = await axios.get(
        `https://text.pollinations.ai/${encodeURIComponent(text)}`,
        { timeout: 20000 }
      );
      return success(res, { reply: data, model: "Pollinations AI" }, "Berhasil mendapat respons AI");
    } catch (e2) {
      return error(res, "Semua AI sedang tidak tersedia. Coba lagi nanti.");
    }
  }
});

/**
 * POST /api/ai
 * Chat dengan AI dengan history percakapan
 * Body: { messages: [{role: "user", content: "..."}, ...] }
 */
router.post("/ai", async (req, res) => {
  const { messages, system } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return error(res, "Body 'messages' wajib berupa array. Contoh: {messages: [{role:'user', content:'Halo'}]}", 400);
  }

  try {
    const payload = { messages };
    if (system) payload.system = system;

    const { data } = await axios.post(
      "https://www.ai4chat.co/generate-response",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0",
          "Referer": "https://www.ai4chat.co/",
        },
        timeout: 30000,
      }
    );
    const reply = data?.message || data?.response || data?.text;
    if (reply) return success(res, { reply, model: "GPT-4" }, "OK");
    throw new Error("Response kosong");
  } catch (e) {
    return error(res, "AI tidak tersedia. Coba lagi nanti.");
  }
});

// ── IMAGE TO PROMPT ──────────────────────────────────────────
/**
 * GET /api/img2prompt?url=https://example.com/image.jpg
 * Analisis gambar dan generate prompt/deskripsi
 */
router.get("/img2prompt", async (req, res) => {
  const { url } = req.query;
  if (!url) return error(res, "Parameter 'url' wajib diisi", 400);
  if (!isValidUrl(url)) return error(res, "URL gambar tidak valid", 400);

  try {
    const { data } = await axios.get(
      `https://api.agatz.xyz/api/img2prompt?url=${encodeURIComponent(url)}`,
      { timeout: 30000 }
    );
    if (!data?.data) throw new Error("Gagal analisis gambar");
    return success(res, { prompt: data.data }, "Berhasil analisis gambar");
  } catch (e) {
    return error(res, e.message || "Gagal analisis gambar");
  }
});

// ── TEXT TO IMAGE ─────────────────────────────────────────────
/**
 * GET /api/txt2img?text=A beautiful sunset over mountains&model=flux
 * Generate gambar dari teks
 */
router.get("/txt2img", async (req, res) => {
  const { text, model = "flux", width = 1024, height = 1024 } = req.query;
  if (!text) return error(res, "Parameter 'text' wajib diisi", 400);

  try {
    // Pollinations.ai - free & no key needed
    const seed = Math.floor(Math.random() * 999999);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(text)}?width=${width}&height=${height}&seed=${seed}&model=${model}&nologo=true`;

    return success(res, {
      url: imageUrl,
      prompt: text,
      model,
      size: `${width}x${height}`,
      seed,
      note: "Gambar di-generate saat URL diakses. Simpan hasilnya karena seed berbeda tiap request.",
    }, "Berhasil generate URL gambar AI");
  } catch (e) {
    return error(res, "Gagal generate gambar");
  }
});

export default router;
