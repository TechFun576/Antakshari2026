const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  song_name: {
    type: String,
    required: true,
  },
  artist: {
    type: String,
    required: true,
  },
  album: {
    type: String,
    required: false,
  },
  intro_audio_url: {
    type: String,
    required: true,
  },
  lyrics_link: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    enum: ['Hindi', 'Bengali', 'English'],
    required: true,
  },
  short_code: {
    type: String,
    required: true,
    unique: true, // e.g., 'H1', 'B2'
  },
  is_selected: {
    type: Boolean,
    default: false,
  },
  added_by: {
    type: String, // Storing username for simplicity
    required: false, // For old seeded songs
  }
});

module.exports = mongoose.model('Song', songSchema);
