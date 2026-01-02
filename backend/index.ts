import express from "express";
import path from "path";
import fs from "fs";
import mm from "music-metadata";
import cors from "cors";
import proxyRouter from "./deezer-proxy";

const app = express();
const PORT = 4000;
const AUDIO_DIR = path.join(process.cwd(), "public");
import db from "./db.json";

app.use(cors());
app.use(express.json());

// To use the app, first populate the [public] directory.
// paste [db.json] or create it in root directory with this schema:
// {
//   songs: [
//      <<song>>
//   ]
// }
// with each <<song>> being of schema:
// {
//   "id": (any unused integer),
//   "name": (name of the mp3 file stored in /public)
//   "deezer_artist_id": (the song artist's ID on Deezer, used for the API calls on the frontend)
// }
// this way the resources don't have to be hardcoded.

// get all songs data
app.get("/songs", async (_req, res) => {
  console.log("------------------------------------------------");
  console.log("Searching for contents in directory:", AUDIO_DIR);
  
  if (!fs.existsSync(AUDIO_DIR)) {
    console.error("Directory does not exist on given path.");
    return res.status(500).json({ message: "Audio directory not found" });
  } else {
    console.log("Directory exists.");
  }
  try {
    // read directory's contents
    fs.readdir(AUDIO_DIR, async (err, files) => {
      if (err) {
        console.error("Directory contents read error: ", err);
        return res.status(500).json({ message: err.message });
      }

      console.log("Found contents:", files);

      // filter to get only .mp3's
      const audioFiles = files.filter(file => file.toLowerCase().endsWith('.mp3'));
      console.log("Songs: ", audioFiles);

      if (audioFiles.length === 0) {
        console.warn("No .mp3's found.");
      }

      // await returning metadata for each file
      const songsMeta = await Promise.all(
        audioFiles.map(async filename => {
          const filePath = path.join(AUDIO_DIR, filename);

          try {
            const meta = await mm.parseFile(filePath);
            const stats = fs.statSync(filePath);

            // album art
            let albumArt = "";
            if (meta.common.picture && meta.common.picture.length > 0) {
              const art = meta.common.picture[0];
              if (art?.data) {
                const mimeType = art.format;
                const buffer = Buffer.from(art.data).toString("base64");
                albumArt = `data:${mimeType};base64,${buffer}`;
              }
            }

            return {
              filename,
              title: meta.common.title || filename, // Fallback la nume fișier
              artist: meta.common.artist || "Unknown artist",
              album: meta.common.album || "Unknown album",
              year: meta.common.year || 0,
              genre: meta.common.genre || "Unknown genre",
              duration: meta.format.duration,
              bitrate: meta.format.bitrate,
              sampleRate: meta.format.sampleRate,
              size: stats.size,
              albumArt,
              deezer_artist_id: db.songs.find(song => song.name === filename)?.deezer_artist_id,
            };
          } catch (error: unknown) {
            // 2. ERROR HANDLING: If a file is corrupted/malformatted don't crash the server
            if (error instanceof Error) {
              console.error(`File read error for ${filename}:`, error.message);
              return null;
            }
          }
        })
      );

      // 3. CLEANUP: Don't send off broken media files
      const validSongs = songsMeta.filter(song => song !== null);

      res.json({ songs: validSongs });
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }
});

// this streams audio
app.get("/stream/:name", async (req, res) => {
  const filePath = path.join(AUDIO_DIR, req.params.name);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "Song not found" });
  }

  const stat = fs.statSync(filePath);
  const range = req.headers.range;

  // no byte range (music part) specified => stream whole file
  if (!range) {
    res.writeHead(200, {
      ["Content-Length"]: stat.size,
      ["Content-Type"]: "audio/mpeg"
    });

    fs.createReadStream(filePath).pipe(res);
    return;
  }

  // send chunk with response 206 (partial response)
  const samples = range
    .replace(/bytes=/, "")
    .split("-");
  const start = parseInt(samples[0]!, 10);
  const end = samples[1] ? parseInt(samples[1], 10) : stat.size - 1;
  const chunkSize = end - start + 1;

  const file = fs.createReadStream(filePath, {
    start,
    end
  });

  res.writeHead(206, {
    ["Content-Range"]: `bytes ${start}-${end}/${stat.size}`,
    ["Accept-Ranges"]: "bytes",
    ["Content-Length"]: chunkSize,
    ["Content-Type"]: "audio/mpeg"
  });

  file.pipe(res);
});

app.use(proxyRouter);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});