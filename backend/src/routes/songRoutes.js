const express = require('express');
const router = express.Router();
const { getSelectedSongs, dualModeShuffle, toggleLock, getGameState, getAllSongs, addSong, deleteSong } = require('../controllers/song.controller');
const { upload } = require('../middleware/upload.middleware');
const { protect } = require('../middleware/auth.middleware');

console.log("Loading songRoutes...");

// Lock & State Routes
router.post('/lock', protect, toggleLock);
router.get('/state', getGameState);

// Shuffle Route (Dual Mode handled in controller)
router.post('/shuffle', protect, dualModeShuffle);

router.get('/selected', getSelectedSongs);
router.get('/', getAllSongs);
router.post('/', protect, upload.single('songFile'), addSong);
router.delete('/:id', protect, deleteSong);

module.exports = router;
