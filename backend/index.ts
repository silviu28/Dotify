const express = require("express");

const _ = require("dotenv");

const app = express();
const PORT = 4000;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});