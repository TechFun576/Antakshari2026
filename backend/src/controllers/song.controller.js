const Song = require('../models/Song');
const SystemState = require('../models/SystemState');
const { FIXED_ROTATION } = require('../config/riggedSets');
const ApiResponse = require('../utils/response.util');
const { uploadOnCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

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

        // 2. Select 5 random songs for each distinct language found in DB
        const languages = await Song.distinct('language');
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

// @desc    Deterministic Shuffle Logic ("Evil Logic")
// @route   POST /api/songs/shuffle
// @access  Public
exports.deterministicShuffle = async (req, res) => {
    try {
        // Step A: Get current shuffle index
        let state = await SystemState.findOne({ key: "current_shuffle_index" });

        if (!state) {
            state = await SystemState.create({ key: "current_shuffle_index", value: 0 });
        }

        const currentIndex = state.value;

        // Step B: Select the list from FIXED_ROTATION
        // Ensure index is within bounds, creating a safeguard
        const safeIndex = currentIndex % FIXED_ROTATION.length;
        const selectedShortCodes = FIXED_ROTATION[safeIndex];

        // Step C: Update the main Song collection
        // 1. Set is_selected: false for all
        await Song.updateMany({}, { is_selected: false });

        // 2. Set is_selected: true ONLY for the songs in the chosen list
        await Song.updateMany(
            { short_code: { $in: selectedShortCodes } },
            { is_selected: true }
        );

        // Step D: Update SystemState
        // Increment the index by 1. If it reaches 4, reset to 0 (Modulo 4)
        state.value = (currentIndex + 1) % 4; // Hardcoded 4 as per requirements, or use FIXED_ROTATION.length
        await state.save();

        // Step E: Return the selected songs to the frontend
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
        const { name, artist, language, lyrics, album } = req.body;
        
        console.log("Received addSong request:", { name, artist, language });
        console.log("File received:", req.file);

        // Check if file is uploaded
        if (!req.file) {
             console.error("No file in request");
             return ApiResponse(res, 400, 'Song file is required');
        }

        if (!name || !artist || !language) {
            console.error("Missing required fields");
            return ApiResponse(res, 400, 'Please provide name, artist, and language');
        }

        const songLocalPath = req.file.path;
        console.log("Uploading to Cloudinary:", songLocalPath);
        
        const songUpload = await uploadOnCloudinary(songLocalPath);

        // if (!songUpload) {
        //      console.error("Cloudinary upload failed");
        //      return ApiResponse(res, 500, 'Failed to upload song file');
        // }

        console.log("Cloudinary upload success:", songUpload.url);
        const url = songUpload.url;

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

// @desc    Delete a song
// @route   DELETE /api/songs/:id
// @access  Protected
exports.deleteSong = async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);

        if (!song) {
            return ApiResponse(res, 404, 'Song not found');
        }

        // Extract public ID from Cloudinary URL
        const urlParts = song.intro_audio_url.split('/');
        const fileNameWithExt = urlParts[urlParts.length - 1]; 
        const publicId = fileNameWithExt.split('.')[0]; 

        // Delete from Cloudinary (assuming video type for audio)
        await deleteFromCloudinary(publicId, 'video'); 

        await Song.findByIdAndDelete(req.params.id);

        return ApiResponse(res, 200, 'Song deleted successfully');
    } catch (err) {
        return ApiResponse(res, 500, err.message);
    }
};
