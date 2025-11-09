import express from "express";
import { exec, execSync } from "child_process";
import fs from "fs";
import path from "path";
import cors from "cors";

const app = express();
const PORT = 4000;
const audioDir = path.join(process.cwd(), "audio");
// Resolve yt-dlp command (prefer local binary on Windows if present)
const localYtDlp = process.platform === "win32" ? path.join(process.cwd(), "yt-dlp.exe") : null;
const ytdlpCmd = localYtDlp && fs.existsSync(localYtDlp) ? `"${localYtDlp}"` : "yt-dlp";

// Check ffmpeg availability (yt-dlp needs it for audio extraction)
function hasFfmpeg() {
  try {
    execSync("ffmpeg -version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

app.use(express.json());
app.use(cors());

// Crée le dossier audio s’il n’existe pas
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir);

// ✅ Endpoint pour convertir une vidéo YouTube en MP3
app.post("/convert", (req, res) => {
  const { videoId } = req.body;
  if (!videoId) return res.status(400).json({ error: "videoId requis" });

  const outputFile = path.join(audioDir, `${videoId}.mp3`);
  const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;

  if (fs.existsSync(outputFile)) {
    return res.json({ success: true, file: `/audio/${videoId}.mp3`, message: "Déjà converti" });
  }

  if (!hasFfmpeg()) {
    return res.status(500).json({
      error: "ffmpeg introuvable",
      message: "Installez ffmpeg ou ajoutez-le au PATH pour permettre l'extraction audio en MP3.",
      hint: "Windows: téléchargez https://www.gyan.dev/ffmpeg/builds/ et ajoutez /bin au PATH"
    });
  }

  const cmd = `${ytdlpCmd} -x --audio-format mp3 --embed-thumbnail -o "${audioDir}/%(id)s.%(ext)s" "${ytUrl}"`;
  console.log("▶️ Commande :", cmd);

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error(stderr);
      return res.status(500).json({ error: "Erreur conversion", details: stderr });
    }

    if (fs.existsSync(outputFile)) {
      res.json({ success: true, file: `/audio/${videoId}.mp3` });
    } else {
      res.status(500).json({ error: "Conversion échouée" });
    }
  });
});

// Sert les fichiers MP3
app.use("/audio", express.static(audioDir));

// Test simple
app.get("/", (req, res) => {
  res.send(`<!doctype html><html lang="fr"><head><meta charset="utf-8"/><title>Musik API</title></head><body style="font-family:Arial;margin:2rem">\n<h3>🎧 API Musik active (port ${PORT})</h3>\n<p>POST <code>/convert</code> JSON: { "videoId": "OITn1QCmfas" }</p>\n<p>Fichier servi ensuite: <code>/audio/OITn1QCmfas.mp3</code></p>\n</body></html>`);
});

// Health endpoint (useful for scripts)
app.get("/health", (req, res) => {
  res.json({ ok: true, port: PORT, ffmpeg: hasFfmpeg(), ytDlp: ytdlpCmd });
});

app.listen(PORT, () => console.log(`✅ Serveur Musik lancé sur http://localhost:${PORT}`));
