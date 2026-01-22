const express = require('express');
const router = express.Router();
const { getSelectedSongs, shuffleSongs, getAllSongs, addSong } = require('../controllers/song.controller');

router.get('/selected', getSelectedSongs);
router.post('/shuffle', shuffleSongs);
router.get('/', getAllSongs);
router.post('/', addSong);

module.exports = router;
