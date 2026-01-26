const express = require('express');
const router = express.Router();
const { getSelectedSongs, shuffleSongs, deterministicShuffle, getAllSongs, addSong, deleteSong } = require('../controllers/song.controller');
const { upload } = require('../middleware/upload.middleware');
const { protect } = require('../middleware/auth.middleware');

router.get('/selected', getSelectedSongs);
// --- TOGGLE SWITCH FOR SHUFFLE LOGIC ---
// Current Mode: Deterministic ("Evil Logic")
router.post('/shuffle', deterministicShuffle);

// Original Random Mode (Uncomment to revert)
// router.post('/shuffle', shuffleSongs);
// ----------------------------------------
router.get('/', getAllSongs);
router.post('/', protect, upload.single('songFile'), addSong);
router.delete('/:id', protect, deleteSong);

module.exports = router;
