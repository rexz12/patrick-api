import axios from "axios";

export async function tiktokDl(url) {
  function formatNumber(integer) {
    let numb = parseInt(integer);
    return Number(numb).toLocaleString().replace(/,/g, ".");
  }

  function formatDate(n) {
    let d = new Date(n * 1000);
    return d.toLocaleDateString("id-ID", {
      weekday: "long", day: "numeric",
      month: "long", year: "numeric",
    });
  }

  // Primary: tikwm.com
  try {
    const res = (await axios.post("https://www.tikwm.com/api/", {}, {
      headers: {
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
      },
      params: { url, count: 12, cursor: 0, web: 1, hd: 1 },
    })).data.data;

    let data = [];
    if (res?.duration == 0) {
      res.images.forEach((v) => data.push({ type: "photo", url: v }));
    } else {
      data.push(
        { type: "watermark", url: "https://www.tikwm.com" + (res?.wmplay || "") },
        { type: "nowatermark", url: "https://www.tikwm.com" + (res?.play || "") },
        { type: "nowatermark_hd", url: "https://www.tikwm.com" + (res?.hdplay || "") },
      );
    }

    return {
      title: res.title,
      taken_at: formatDate(res.create_time),
      region: res.region,
      id: res.id,
      duration: res.duration + " detik",
      cover: "https://www.tikwm.com" + res.cover,
      downloads: data,
      music: {
        id: res.music_info?.id,
        title: res.music_info?.title,
        author: res.music_info?.author,
        url: "https://www.tikwm.com" + (res?.music || res.music_info?.play || ""),
      },
      stats: {
        views: formatNumber(res.play_count),
        likes: formatNumber(res.digg_count),
        comments: formatNumber(res.comment_count),
        shares: formatNumber(res.share_count),
        downloads: formatNumber(res.download_count),
      },
      author: {
        id: res.author?.id,
        username: res.author?.unique_id,
        nickname: res.author?.nickname,
        avatar: "https://www.tikwm.com" + res.author?.avatar,
      },
    };
  } catch (err) {
    // Fallback: yuulabs
    const { data } = await axios.get(
      `https://api.yuulabs.web.id/api/downloader/tiktok?url=${encodeURIComponent(url)}`,
      { timeout: 30000 }
    );
    if (!data?.status || !data?.result) throw new Error("Gagal mengambil data TikTok");
    const r = data.result;
    const downloads = [];
    if (r.videoUrl) downloads.push({ type: "nowatermark", url: r.videoUrl });
    if (r.videoUrlWatermark) downloads.push({ type: "watermark", url: r.videoUrlWatermark });
    if (r.images?.length) r.images.forEach(u => downloads.push({ type: "photo", url: u }));
    return {
      title: r.title || "",
      author: { username: r.author || "" },
      cover: r.cover || "",
      music: { url: r.music || "" },
      downloads,
    };
  }
}
