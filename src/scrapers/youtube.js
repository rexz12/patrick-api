import axios from "axios";

const YT_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)/;

export function isYoutubeUrl(url) {
  return YT_REGEX.test(url);
}

export async function ytMp3(url) {
  // Primary API
  try {
    const { data } = await axios.get(
      `https://api.nexray.eu.cc/downloader/v1/ytmp3?url=${encodeURIComponent(url)}`,
      { timeout: 20000 }
    );
    if (data?.result?.url) {
      return {
        title: data.result.title || "Unknown",
        duration: data.result.duration || "-",
        thumbnail: data.result.thumbnail || "",
        download: data.result.url,
        quality: "128kbps",
        format: "mp3",
      };
    }
  } catch {}

  // Fallback: y2mate style
  try {
    const { data } = await axios.get(
      `https://api.fabdl.com/youtube/get?url=${encodeURIComponent(url)}`,
      { timeout: 20000 }
    );
    if (data?.result?.download_url) {
      return {
        title: data.result.title || "Unknown",
        duration: data.result.duration || "-",
        thumbnail: data.result.thumbnail || "",
        download: data.result.download_url,
        format: "mp3",
      };
    }
  } catch {}

  throw new Error("Gagal mendapatkan link download YouTube MP3");
}

export async function ytMp4(url) {
  try {
    const { data } = await axios.get(
      `https://api.nexray.eu.cc/downloader/v1/ytmp4?url=${encodeURIComponent(url)}`,
      { timeout: 20000 }
    );
    if (data?.result?.url) {
      return {
        title: data.result.title || "Unknown",
        duration: data.result.duration || "-",
        thumbnail: data.result.thumbnail || "",
        download: data.result.url,
        quality: data.result.quality || "720p",
        format: "mp4",
      };
    }
  } catch {}

  throw new Error("Gagal mendapatkan link download YouTube MP4");
}

export async function ytSearch(query) {
  const { data } = await axios.get(
    `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%3D%3D`,
    {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 15000,
    }
  );

  const match = data.match(/var ytInitialData = ({.*?});/s);
  if (!match) throw new Error("Gagal parse YouTube search");

  const json = JSON.parse(match[1]);
  const items = json?.contents?.twoColumnSearchResultsRenderer
    ?.primaryContents?.sectionListRenderer?.contents?.[0]
    ?.itemSectionRenderer?.contents || [];

  const results = [];
  for (const item of items) {
    const v = item.videoRenderer;
    if (!v) continue;
    results.push({
      id: v.videoId,
      title: v.title?.runs?.[0]?.text || "",
      url: `https://youtube.com/watch?v=${v.videoId}`,
      channel: v.ownerText?.runs?.[0]?.text || "",
      duration: v.lengthText?.simpleText || "",
      views: v.viewCountText?.simpleText || "",
      thumbnail: v.thumbnail?.thumbnails?.slice(-1)?.[0]?.url || "",
      published: v.publishedTimeText?.simpleText || "",
    });
    if (results.length >= 8) break;
  }

  return results;
}
