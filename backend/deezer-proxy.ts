import express from "express";

const router = express.Router();

// since we can't call the Deezer API right from our frontend,
// we must declare a proxy endpoint to do it for us.
router.get("/deezer/artist/:id", async (req, res) => {
  const id = req.params.id;

  const response = await fetch(`https://api.deezer.com/artist/${id}`);
  const data = await response.json();

  res.json(data);
});

export default router;