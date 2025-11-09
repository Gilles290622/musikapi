import express from "express";
import cors from "cors";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 4000;
const API_KEY = process.env.API_KEY || "FullnessVoice2025"; // 🔒 clé de sécurité
const audioDir = path.join(process.cwd(), "audio");

// Middlewares
app.use(cors());
app.use(express.json());

// Dossier audio
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

// 🌐 Page de test
app.get("/", (req, res) => {
  res.send(`
    <h2>🎶 Musik API – Fullness Voice</h2>
    <p>Utilisation : POST /convert avec JSON { "videoId": "XXXXXXXXXXX", "key": "${API_KEY}" }</p>
    <p>Exemple : <code>curl -X POST -H "Content-Type: application/json" -d '{"videoId":"OITn1QCmfas","key":"${API_KEY}"}' ${req.protocol}://${req.get("host")}/convert</code></p>
  `);
});

// 🎧 Conversion principale
app.post("/convert", (req, res) => {
  const { videoId, key } = req.body;

  if (!videoId) return res.status(400).json({ error: "videoId requis" });
  if (key !== API_KEY) return res.status(403).json({ error: "Clé API invalide" });

  const safeId = videoId.replace(/[^A-Za-z0-9_-]/g, "");
  const outputFile = path.join(audioDir, `${safeId}.mp3`);
  const ytUrl = `https://www.youtube.com/watch?v=${safeId}`;

  // Si déjà converti
  if (fs.existsSync(outputFile)) {
    return res.json({
      success: true,
      message: "Déjà converti",
      file: `/audio/${safeId}.mp3`
    });
  }

  const command = `yt-dlp -x --audio-format mp3 --no-playlist -o "${audioDir}/%(id)s.%(ext)s" "${ytUrl}"`;

  console.log("🎬 Conversion :", command);

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Erreur :", stderr);
      return res.status(500).json({
        error: "Erreur de conversion",
        exit_code: err.code,
        cmd: command,
        output: stderr
      });
    }

    if (fs.existsSync(outputFile)) {
      console.log(`✅ Conversion terminée : ${outputFile}`);
      res.json({
        success: true,
        message: "Conversion réussie",
        file: `/audio/${safeId}.mp3`
      });
    } else {
      console.warn("⚠️ Fichier non trouvé après conversion.");
      res.status(500).json({ error: "Conversion échouée", output: stdout });
    }
  });
});

// 📦 Servir les fichiers MP3
app.use("/audio", express.static(audioDir));

// 🚀 Lancer le serveur avec gestion EADDRINUSE
function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`✅ Musik API opérationnelle sur http://localhost:${port}`);
  });
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`❌ Port ${port} déjà utilisé. Réessayez avec PORT différent (ex: 4100) : set PORT=4100 && npm start`);
    } else {
      console.error("❌ Erreur serveur:", err);
    }
    process.exit(1);
  });
}

startServer(PORT);
