import express from "express";
import path from "path";
import fs from "fs";

import _ from "dotenv";

const app = express();
const PORT = 4000;
const AUDIO_DIR = path.join(__dirname, "./public");

app.use(express.json());

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