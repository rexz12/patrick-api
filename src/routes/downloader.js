import { Router } from "express";
import { success, error, isValidUrl } from "../middleware/response.js";
import { tiktokDl } from "../scrapers/tiktok.js";
import { ytMp3, ytMp4, ytSearch, isYoutubeUrl } from "../scrapers/youtube.js";
import { instagramDl, twitterDl, facebookDl, spotifyDl } from "../scrapers/social.js";

const router = Router();

// ── TIKTOK ───────────────────────────────────────────────────
/**
 * GET /api/tiktok?url=https://vt.tiktok.com/xxx
 * Download video/slideshow TikTok tanpa watermark
 */
router.get("/tiktok", async (req, res) => {
  const { url } = req.query;
  if (!url) return error(res, "Parameter 'url' wajib diisi. Contoh: /api/tiktok?url=https://vt.tiktok.com/xxx", 400);
  if (!isValidUrl(url)) return error(res, "URL tidak valid", 400);

  try {
    const result = await tiktokDl(url);
    return success(res, result, "Berhasil mengambil data TikTok");
  } catch (e) {
    return error(res, e.message || "Gagal download TikTok");
  }
});

// ── YOUTUBE ──────────────────────────────────────────────────
/**
 * GET /api/ytmp3?url=https://youtube.com/watch?v=xxx
 * Download audio YouTube format MP3
 */
router.get("/ytmp3", async (req, res) => {
  const { url } = req.query;
  if (!url) return error(res, "Parameter 'url' wajib diisi", 400);
  if (!isYoutubeUrl(url)) return error(res, "URL harus berupa link YouTube", 400);

  try {
    const result = await ytMp3(url);
    return success(res, result, "Berhasil mengambil audio YouTube");
  } catch (e) {
    return error(res, e.message || "Gagal download YouTube MP3");
  }
});

/**
 * GET /api/ytmp4?url=https://youtube.com/watch?v=xxx
 * Download video YouTube format MP4
 */
router.get("/ytmp4", async (req, res) => {
  const { url } = req.query;
  if (!url) return error(res, "Parameter 'url' wajib diisi", 400);
  if (!isYoutubeUrl(url)) return error(res, "URL harus berupa link YouTube", 400);

  try {
    const result = await ytMp4(url);
    return success(res, result, "Berhasil mengambil video YouTube");
  } catch (e) {
    return error(res, e.message || "Gagal download YouTube MP4");
  }
});

/**
 * GET /api/ytsearch?q=lagu+pop+indonesia
 * Cari video di YouTube
 */
router.get("/ytsearch", async (req, res) => {
  const { q } = req.query;
  if (!q) return error(res, "Parameter 'q' wajib diisi. Contoh: /api/ytsearch?q=alan+walker", 400);

  try {
    const result = await ytSearch(q);
    return success(res, result, `Hasil pencarian: ${q}`);
  } catch (e) {
    return error(res, e.message || "Gagal mencari di YouTube");
  }
});

// ── INSTAGRAM ────────────────────────────────────────────────
/**
 * GET /api/instagram?url=https://www.instagram.com/reel/xxx
 * Download foto/video/reel Instagram
 */
router.get("/instagram", async (req, res) => {
  const { url } = req.query;
  if (!url) return error(res, "Parameter 'url' wajib diisi", 400);
  if (!url.includes("instagram.com")) return error(res, "URL harus berupa link Instagram", 400);

  try {
    const result = await instagramDl(url);
    return success(res, result, "Berhasil mengambil media Instagram");
  } catch (e) {
    return error(res, e.message || "Gagal download Instagram");
  }
});

// ── TWITTER / X ──────────────────────────────────────────────
/**
 * GET /api/twitter?url=https://twitter.com/user/status/xxx
 * Download video/foto dari Twitter/X
 */
router.get("/twitter", async (req, res) => {
  const { url } = req.query;
  if (!url) return error(res, "Parameter 'url' wajib diisi", 400);
  if (!url.includes("twitter.com") && !url.includes("x.com"))
    return error(res, "URL harus berupa link Twitter/X", 400);

  try {
    const result = await twitterDl(url);
    return success(res, result, "Berhasil mengambil media Twitter/X");
  } catch (e) {
    return error(res, e.message || "Gagal download Twitter/X");
  }
});

// ── FACEBOOK ─────────────────────────────────────────────────
/**
 * GET /api/facebook?url=https://facebook.com/xxx
 * Download video Facebook
 */
router.get("/facebook", async (req, res) => {
  const { url } = req.query;
  if (!url) return error(res, "Parameter 'url' wajib diisi", 400);
  if (!url.includes("facebook.com") && !url.includes("fb.com"))
    return error(res, "URL harus berupa link Facebook", 400);

  try {
    const result = await facebookDl(url);
    return success(res, result, "Berhasil mengambil video Facebook");
  } catch (e) {
    return error(res, e.message || "Gagal download Facebook");
  }
});

// ── SPOTIFY ──────────────────────────────────────────────────
/**
 * GET /api/spotify?url=https://open.spotify.com/track/xxx
 * Download lagu dari Spotify
 */
router.get("/spotify", async (req, res) => {
  const { url } = req.query;
  if (!url) return error(res, "Parameter 'url' wajib diisi", 400);
  if (!url.includes("spotify.com")) return error(res, "URL harus berupa link Spotify", 400);

  try {
    const result = await spotifyDl(url);
    return success(res, result, "Berhasil mengambil lagu Spotify");
  } catch (e) {
    return error(res, e.message || "Gagal download Spotify");
  }
});

export default router;
