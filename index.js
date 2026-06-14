import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import downloaderRoutes from "./src/routes/downloader.js";
import toolsRoutes from "./src/routes/tools.js";
import aiRoutes from "./src/routes/ai.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiter - 60 request per menit per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: {
    status: false,
    code: 429,
    message: "Terlalu banyak request. Coba lagi 1 menit lagi.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Welcome
app.get("/", (req, res) => {
  res.json({
    status: true,
    name: "Patrick API",
    version: "1.0.0",
    author: "rexz12",
    github: "https://github.com/rexz12/patrick-api",
    endpoints: {
      downloader: [
        "GET /api/tiktok?url=",
        "GET /api/ytmp3?url=",
        "GET /api/ytmp4?url=",
        "GET /api/instagram?url=",
        "GET /api/facebook?url=",
        "GET /api/twitter?url=",
        "GET /api/spotify?url=",
      ],
      tools: [
        "GET /api/ssweb?url=",
        "GET /api/remobg?url=",
        "GET /api/qr?text=",
        "GET /api/ocr?url=",
        "GET /api/tempmail",
        "GET /api/ipinfo?ip=",
      ],
      ai: [
        "GET /api/ai?text=",
        "GET /api/img2prompt?url=",
      ],
    },
    rateLimit: "60 request/menit per IP",
  });
});

// Routes
app.use("/api", downloaderRoutes);
app.use("/api", toolsRoutes);
app.use("/api", aiRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({
    status: false,
    code: 404,
    message: `Endpoint '${req.path}' tidak ditemukan. Cek GET / untuk daftar endpoint.`,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    status: false,
    code: 500,
    message: "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Patrick API berjalan di http://localhost:${PORT}`);
  console.log(`📦 Endpoints tersedia di http://localhost:${PORT}/\n`);
});
