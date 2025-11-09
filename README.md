# MusikApi

Node.js API pour convertir des vidéos YouTube en MP3 et les servir localement.

## Scripts

- `npm start` — démarre le serveur (port 4000)

## Endpoints

- `GET /` — page d’accueil avec instructions
- `GET /health` — status JSON (port, ffmpeg, yt-dlp)
- `POST /convert` — lance la conversion YouTube → MP3, corps JSON: `{ "videoId": "<id youtube>" }`
- `GET /audio/:file` — sert un fichier MP3 du dossier `audio/`

## Arborescence

```
MusikApi/
├─ audio/
├─ server.js
├─ package.json
└─ README.md
```

## Prérequis

- Node.js 18+
- yt-dlp (fourni en local sous Windows : `yt-dlp.exe` à la racine)
- ffmpeg installé et disponible dans le PATH (requis par yt-dlp pour l’extraction audio)

Windows (ffmpeg rapide) : téléchargez une build de https://www.gyan.dev/ffmpeg/builds/ (release full ou essentials),
extrayez, puis ajoutez le répertoire `bin` dans votre variable d’environnement `PATH`.

## Utilisation

1. Démarrer le serveur:
	```powershell
	npm start
	```
2. Convertir une vidéo (exemple):
	```powershell
	$body = @{ videoId = 'OITn1QCmfas' } | ConvertTo-Json
	Invoke-RestMethod -Uri http://localhost:4000/convert -Method Post -Body $body -ContentType 'application/json'
	```
3. Lire le fichier converti:
	- http://localhost:4000/audio/OITn1QCmfas.mp3

Notes:
- Les MP3 générés sont placés dans `audio/` et ignorés par Git.
- Si `/convert` retourne une erreur `ffmpeg introuvable`, installez ffmpeg et relancez.
