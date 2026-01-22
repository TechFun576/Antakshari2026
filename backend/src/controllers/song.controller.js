const Song = require('../models/Song');
const ApiResponse = require('../utils/response.util');

// @desc    Get all selected songs
// @route   GET /api/songs/selected
// @access  Public
exports.getSelectedSongs = async (req, res) => {
    try {
        const selectedSongs = await Song.find({ is_selected: true });
        return ApiResponse(res, 200, 'Selected songs fetched successfully', selectedSongs);
    } catch (err) {
        return ApiResponse(res, 500, err.message);
    }
};

// @desc    Shuffle and select new random songs
// @route   POST /api/songs/shuffle
// @access  Public
exports.shuffleSongs = async (req, res) => {
    try {
        // 1. Reset all songs to unselected
        await Song.updateMany({}, { is_selected: false });

        // 2. Select 5 random songs for each language
        const languages = ['Hindi', 'Bengali', 'English'];
        let selectedIds = [];

        for (const lang of languages) {
            const songs = await Song.find({ language: lang });
            if (!songs || songs.length === 0) continue;
            
            // Random shuffle
            const shuffled = songs.sort(() => 0.5 - Math.random());
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
        return ApiResponse(res, 200, 'Songs shuffled successfully', newSelection);

    } catch (err) {
        return ApiResponse(res, 500, err.message);
    }
};

// @desc    Add a new song
// @route   POST /api/songs
// @access  Protected
exports.addSong = async (req, res) => {
    try {
        const { name, artist, language, url, lyrics, album } = req.body;

        if (!name || !artist || !language || !url) {
            return ApiResponse(res, 400, 'Please provide name, artist, language, and url');
        }

        // Check for duplicate song name (case-insensitive)
        const existingSong = await Song.findOne({ 
            song_name: { $regex: new RegExp(`^${name}$`, 'i') } 
        });

        if (existingSong) {
            // Warn the user and request change
            return ApiResponse(res, 409, `A song with the name "${existingSong.song_name}" already exists. Please choose a different name.`);
        }

        // Generate short_code (e.g., H1, E5)
        // Find the count of songs in this language to append the number
        const count = await Song.countDocuments({ language });
        const short_code = `${language.charAt(0).toUpperCase()}${count + 1}`;

        const newSong = await Song.create({
            song_name: name,
            artist,
            language,
            intro_audio_url: url,
            lyrics_link: lyrics || '',
            album,
            short_code,
            is_selected: false,
            added_by: req.user.username
        });

        return ApiResponse(res, 201, 'Song added successfully', newSong);
    } catch (err) {
        // Handle duplicate short_code edge case by retrying or appending timestamp (simplified here)
        if (err.code === 11000) {
             return ApiResponse(res, 400, 'Duplicate song or short code error. Please try again.');
        }
        return ApiResponse(res, 500, err.message);
    }
};

// @desc    Get all songs (Dev helper)
// @route   GET /api/songs
// @access  Public
exports.getAllSongs = async (req, res) => {
    try {
        const songs = await Song.find().sort({ createdAt: -1 });
        return ApiResponse(res, 200, 'All songs fetched', songs);
    } catch (err) {
        return ApiResponse(res, 500, err.message);
    }
};
