import express from "express";
import path from "path";
import fs from "fs";
import mm from "music-metadata";
import _ from "dotenv";
import cors from "cors";

const app = express();
const PORT = 4000;
const AUDIO_DIR = path.join(__dirname, "./public");

app.use(cors());
app.use(express.json());

// get all songs data
app.get("/songs", async (req, res) => {
  try {
    // read directory's contents
    fs.readdir(AUDIO_DIR, async (err, files) => {
      if (err) {
        return res.status(500).json({
          message: err.message,
        });
      }

      // await returning metadata for each file
      const songsMeta = await Promise.all(
        files.map(async filename => {
          const filePath = path.join(AUDIO_DIR, filename);

          try {
            const meta = await mm.parseFile(filePath);
            const stats = fs.statSync(filePath);

            // album art
            let albumArt: any = null;
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
              title: meta.common.title || "Unknown title",
              artist: meta.common.artist || "Unknown artist",
              album: meta.common.album || "Unkown album",
              year: meta.common.year || 0,
              genre: meta.common.genre || "Unknown genre",
              duration: meta.format.duration,
              bitrate: meta.format.bitrate,
              sampleRate: meta.format.sampleRate,
              size: stats.size,
              albumArt
            };
          } catch (error: any) {
            res.status(500).json({
              message: error.message,
            });
          }
        })
      );

      res.json({ songs: songsMeta });
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
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

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});