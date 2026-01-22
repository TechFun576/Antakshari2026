const express = require('express');
const router = express.Router();
const Song = require('../models/Song');

// GET /api/songs/selected
// Fetches only songs where is_selected: true
router.get('/songs/selected', async (req, res) => {
  try {
    const selectedSongs = await Song.find({ is_selected: true });
    res.json(selectedSongs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/shuffle
// Sets is_selected: false for ALL songs.
// Randomly selects 5 songs per language using Math.random().
// Updates those 15 songs to is_selected: true.
// Returns the new list.
router.post('/shuffle', async (req, res) => {
  try {
    // 1. Reset all songs to unselected
    await Song.updateMany({}, { is_selected: false });

    // 2. Select 5 random songs for each language
    const languages = ['Hindi', 'Bengali', 'English'];
    let selectedIds = [];

    for (const lang of languages) {
      // Get all songs for this language
      const songs = await Song.find({ language: lang });
      
      // Shuffle array using Math.random()
      const shuffled = songs.sort(() => 0.5 - Math.random());
      
      // Take first 5
      const selected = shuffled.slice(0, 5);
      
      selected.forEach(song => selectedIds.push(song._id));
    }

    // 3. Update selected songs in DB
    await Song.updateMany(
      { _id: { $in: selectedIds } },
      { is_selected: true }
    );

    // 4. Return the new list
    const newSelection = await Song.find({ is_selected: true });
    res.json(newSelection);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Helper route to seed or view all (optional, for dev)
router.get('/songs', async (req, res) => {
    try {
        const songs = await Song.find();
        res.json(songs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
