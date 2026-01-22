const mongoose = require('mongoose');
const Song = require('./models/Song');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/antakshari2025')
.then(() => {
  console.log('MongoDB Connected for Seeding');
  return seedDB();
})
.catch(err => {
  console.error('Seeding connection error:', err); 
  process.exit(1);
});

const seedDB = async () => {
    await Song.deleteMany({});

    const songs = [
        // Hindi (10 songs)
        { song_name: 'Tum Hi Ho', artist: 'Arijit Singh', intro_audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', lyrics_link: 'https://example.com/lyrics1', language: 'Hindi', short_code: 'H1', added_by: 'Admin' },
        { song_name: 'Chaiyya Chaiyya', artist: 'Sukhwinder Singh', intro_audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', lyrics_link: 'https://example.com/lyrics2', language: 'Hindi', short_code: 'H2', added_by: 'Admin' },
        { song_name: 'Kal Ho Naa Ho', artist: 'Sonu Nigam', intro_audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', lyrics_link: 'https://example.com/lyrics3', language: 'Hindi', short_code: 'H3', added_by: 'Admin' },
        { song_name: 'Jai Ho', artist: 'A.R. Rahman', intro_audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', lyrics_link: 'https://example.com/lyrics4', language: 'Hindi', short_code: 'H4', added_by: 'Admin' },
        { song_name: 'Kabira', artist: 'Tochi Raina', intro_audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', lyrics_link: 'https://example.com/lyrics5', language: 'Hindi', short_code: 'H5', added_by: 'Admin' },
        { song_name: 'Senorita', artist: 'Farhan Akhtar', intro_audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', lyrics_link: 'https://example.com/lyrics6', language: 'Hindi', short_code: 'H6', added_by: 'Admin' },
        { song_name: 'Gerua', artist: 'Arijit Singh', intro_audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', lyrics_link: 'https://example.com/lyrics7', language: 'Hindi', short_code: 'H7', added_by: 'Admin' },
        { song_name: 'Zinda', artist: 'Farhan Akhtar', intro_audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', lyrics_link: 'https://example.com/lyrics8', language: 'Hindi', short_code: 'H8', added_by: 'Admin' },
        { song_name: 'Galliyan', artist: 'Ankit Tiwari', intro_audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', lyrics_link: 'https://example.com/lyrics9', language: 'Hindi', short_code: 'H9', added_by: 'Admin' },
        { song_name: 'Raabta', artist: 'Arijit Singh', intro_audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', lyrics_link: 'https://example.com/lyrics10', language: 'Hindi', short_code: 'H10', added_by: 'Admin' },

        // Bengali (10 songs)
        { song_name: 'Ami Je Tomar', artist: 'Shreya Ghoshal', intro_audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', lyrics_link: 'https://example.com/lyrics11', language: 'Bengali', short_code: 'B1', added_by: 'Admin' },
        { song_name: 'Bhebe Dekhecho Ki', artist: 'Moheener Ghoraguli', intro_audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', lyrics_link: 'https://example.com/lyrics12', language: 'Bengali', short_code: 'B2', added_by: 'Admin' },
        { song_name: 'Tomake', artist: 'Shreya Ghoshal', intro_audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3', lyrics_link: 'https://example.com/lyrics13', language: 'Bengali', short_code: 'B3', added_by: 'Admin' },
        { song_name: 'Amake Amar Moto', artist: 'Anupam Roy', intro_audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3', lyrics_link: 'https://example.com/lyrics14', language: 'Bengali', short_code: 'B4', added_by: 'Admin' },
        { song_name: 'Bojhena Shey Bojhena', artist: 'Arijit Singh', intro_audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3', lyrics_link: 'https://example.com/lyrics15', language: 'Bengali', short_code: 'B5', added_by: 'Admin' },
        { song_name: 'Tumi Ashbe Bole', artist: 'Nachiketa', intro_audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3', lyrics_link: 'https://example.com/lyrics16', language: 'Bengali', short_code: 'B6', added_by: 'Admin' },
        { song_name: 'Ei Obelay', artist: 'Shreya', intro_audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', lyrics_link: 'https://example.com/lyrics17', language: 'Bengali', short_code: 'B7', added_by: 'Admin' },
        { song_name: 'Pherari Mon', artist: 'Anupam Roy', intro_audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', lyrics_link: 'https://example.com/lyrics18', language: 'Bengali', short_code: 'B8', added_by: 'Admin' },
        { song_name: 'Hariye Jawar Gaan', artist: 'Fossils', intro_audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', lyrics_link: 'https://example.com/lyrics19', language: 'Bengali', short_code: 'B9', added_by: 'Admin' },
        { song_name: 'Hasnuhana', artist: 'Fossils', intro_audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', lyrics_link: 'https://example.com/lyrics20', language: 'Bengali', short_code: 'B10', added_by: 'Admin' },

        // English (10 songs)
        { song_name: 'Shape of You', artist: 'Ed Sheeran', intro_audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', lyrics_link: 'https://example.com/lyrics21', language: 'English', short_code: 'E1', added_by: 'Admin' },
        { song_name: 'Blinding Lights', artist: 'The Weeknd', intro_audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', lyrics_link: 'https://example.com/lyrics22', language: 'English', short_code: 'E2', added_by: 'Admin' },
        { song_name: 'Someone Like You', artist: 'Adele', intro_audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', lyrics_link: 'https://example.com/lyrics23', language: 'English', short_code: 'E3', added_by: 'Admin' },
        { song_name: 'Bohemian Rhapsody', artist: 'Queen', intro_audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', lyrics_link: 'https://example.com/lyrics24', language: 'English', short_code: 'E4', added_by: 'Admin' },
        { song_name: 'Hotel California', artist: 'Eagles', intro_audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', lyrics_link: 'https://example.com/lyrics25', language: 'English', short_code: 'E5', added_by: 'Admin' },
        { song_name: 'Imagine', artist: 'John Lennon', intro_audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', lyrics_link: 'https://example.com/lyrics26', language: 'English', short_code: 'E6', added_by: 'Admin' },
        { song_name: 'Smells Like Teen Spirit', artist: 'Nirvana', intro_audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', lyrics_link: 'https://example.com/lyrics27', language: 'English', short_code: 'E7', added_by: 'Admin' },
        { song_name: 'Billie Jean', artist: 'Michael Jackson', intro_audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', lyrics_link: 'https://example.com/lyrics28', language: 'English', short_code: 'E8', added_by: 'Admin' },
        { song_name: 'Rolling in the Deep', artist: 'Adele', intro_audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3', lyrics_link: 'https://example.com/lyrics29', language: 'English', short_code: 'E9', added_by: 'Admin' },
        { song_name: 'Uptown Funk', artist: 'Mark Ronson', intro_audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3', lyrics_link: 'https://example.com/lyrics30', language: 'English', short_code: 'E10', added_by: 'Admin' },
    ];

    await Song.insertMany(songs);
    console.log('Database Seeded!');
    process.exit();
};
