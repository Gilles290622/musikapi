import express from "express";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import cors from "cors";

const app = express();
const PORT = 4000;
const audioDir = path.join(process.cwd(), "audio");

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

  const cmd = `yt-dlp -x --audio-format mp3 -o "${audioDir}/%(id)s.%(ext)s" "${ytUrl}"`;
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
  res.send("<h3>🎧 API Musik locale active<br>POST /convert avec { videoId: 'xxxxx' }</h3>");
});

app.listen(PORT, () => console.log(`✅ Serveur Musik lancé sur http://localhost:${PORT}`));
