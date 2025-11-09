# MusikApi

A simple Node.js audio server.

## Scripts

- `npm start` — start the server

## Endpoints

- `/` — health check
- `/audio/:file` — stream an audio file from the `audio/` directory

## Project structure

```
MusikApi/
├─ audio/
├─ server.js
├─ package.json
└─ README.md
```

## Requirements

- Node.js 18+

## Usage

1. Put audio files into the `audio/` folder.
2. Start the server with `npm start`.
3. Open `http://localhost:3000/audio/<file>` in your browser.
