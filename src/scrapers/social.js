import axios from "axios";

// ── INSTAGRAM ──────────────────────────────────────────────────
export async function instagramDl(url) {
  // Primary: SnapSave
  try {
    const form = new URLSearchParams({ url });
    const { data } = await axios.post("https://snapsave.app/action.php", form, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": "https://snapsave.app/",
      },
      timeout: 20000,
    });
    if (data?.url) {
      const media = Array.isArray(data.url)
        ? data.url.map(u => ({ type: u.includes(".mp4") ? "video" : "image", url: u }))
        : [{ type: data.url.includes(".mp4") ? "video" : "image", url: data.url }];
      return { media };
    }
  } catch {}

  // Fallback: API publik
  const { data } = await axios.get(
    `https://api.agatz.xyz/api/instagram?url=${encodeURIComponent(url)}`,
    { timeout: 20000 }
  );
  if (!data?.data?.length) throw new Error("Gagal mengambil media Instagram");
  return {
    media: data.data.map(d => ({ type: d.type || "image", url: d.url })),
  };
}

// ── TWITTER / X ────────────────────────────────────────────────
export async function twitterDl(url) {
  const { data } = await axios.get(
    `https://api.agatz.xyz/api/twitter?url=${encodeURIComponent(url)}`,
    { timeout: 20000 }
  );
  if (!data?.data) throw new Error("Gagal mengambil media Twitter/X");

  const r = data.data;
  return {
    id: r.id || "",
    text: r.text || "",
    author: r.author || "",
    media: (r.media || []).map(m => ({
      type: m.type,
      url: m.url,
      quality: m.quality || null,
    })),
  };
}

// ── FACEBOOK ───────────────────────────────────────────────────
export async function facebookDl(url) {
  const { data } = await axios.get(
    `https://api.agatz.xyz/api/facebook?url=${encodeURIComponent(url)}`,
    { timeout: 20000 }
  );
  if (!data?.data) throw new Error("Gagal mengambil media Facebook");
  return {
    title: data.data.title || "",
    duration: data.data.duration || "",
    downloads: [
      data.data.sd && { quality: "SD", url: data.data.sd },
      data.data.hd && { quality: "HD", url: data.data.hd },
    ].filter(Boolean),
  };
}

// ── SPOTIFY ────────────────────────────────────────────────────
export async function spotifyDl(url) {
  const { data } = await axios.get(
    `https://api.fabdl.com/spotify/get?url=${encodeURIComponent(url)}`,
    { timeout: 20000 }
  );
  if (!data?.result) throw new Error("Gagal mengambil data Spotify");
  const r = data.result;
  return {
    title: r.title || "",
    artists: r.artists || "",
    album: r.album || "",
    duration: r.duration || "",
    cover: r.image || "",
    download: r.download_url || "",
  };
}
