const Song = require('../models/Song');
const SystemState = require('../models/SystemState');
const { FIXED_ROTATION } = require('../config/riggedSets');
const ApiResponse = require('../utils/response.util');
const { uploadOnCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
const ADMIN_EMAIL = 'admin@gmail.com';

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

// @desc    Get current game state (Lock status & Locked Songs)
// @route   GET /api/songs/state
// @access  Public
exports.getGameState = async (req, res) => {
    try {
        const lockState = await SystemState.findOne({ key: "is_shuffle_locked" });
        const isLocked = lockState ? (lockState.value === 1) : false;

        let lockedSongs = [];
        if (isLocked) {
           lockedSongs = await Song.find({ is_selected: true });
        }

        return ApiResponse(res, 200, 'Game state fetched', { isLocked, lockedSongs });
    } catch (err) {
        return ApiResponse(res, 500, err.message);
    }
};

// @desc    Toggle Shuffle Lock (Admin Only)
// @route   POST /api/songs/lock
// @access  Protected (Admin)
exports.toggleLock = async (req, res) => {
    console.log("Toggle Lock Request from:", req.user?.email);
    
    if (req.user.email !== ADMIN_EMAIL) {
        console.log("Toggle Lock Denied: Not Admin");
        return ApiResponse(res, 403, 'Not authorized. Admin only.');
    }

    try {
        let lockState = await SystemState.findOne({ key: "is_shuffle_locked" });
        if (!lockState) {
            lockState = await SystemState.create({ key: "is_shuffle_locked", value: 0 });
        }

        // Toggle value (0 -> 1, 1 -> 0)
        lockState.value = lockState.value === 0 ? 1 : 0;
        await lockState.save();

        const isLocked = lockState.value === 1;
        console.log("Lock Toggled. New State:", isLocked);
        return ApiResponse(res, 200, `Shuffle ${isLocked ? 'Locked' : 'Unlocked'} successfully`, { isLocked });

    } catch (err) {
        return ApiResponse(res, 500, err.message);
    }
};

// @desc    Dual Mode Shuffle
// @route   POST /api/songs/shuffle
// @access  Protected
exports.dualModeShuffle = async (req, res) => {
    try {
        const userEmail = req.user?.email;
        const isAdmin = userEmail === ADMIN_EMAIL;
        
        console.log("Shuffle Request - User:", userEmail, "IsAdmin:", isAdmin);

        // Check Lock State
        const lockState = await SystemState.findOne({ key: "is_shuffle_locked" });
        const isLocked = lockState ? (lockState.value === 1) : false;

        // --- ADMIN LOGIC ("Evil" / Deterministic) ---
        if (isAdmin) {
             // Admin can always shuffle, even if locked (Changing the locked set essentially)
             console.log("Executing Admin Deterministic Shuffle");
             return await deterministicShuffleInternal(req, res);
        }

        // --- USER LOGIC ("Saint" / Random) ---
        if (isLocked) {
            return ApiResponse(res, 403, 'Shuffle is currently locked by Admin.');
        }

        return await randomShuffleInternal(req, res);

    } catch (err) {
        return ApiResponse(res, 500, err.message);
    }
};

// Internal Helper: Deterministic Evil Shuffle (Updates DB)
const deterministicShuffleInternal = async (req, res) => {
    // Step A: Get current shuffle index
    let state = await SystemState.findOne({ key: "current_shuffle_index" });
    if (!state) state = await SystemState.create({ key: "current_shuffle_index", value: 0 });

    const currentIndex = state.value;
    const safeIndex = currentIndex % FIXED_ROTATION.length;
    const selectedShortCodes = FIXED_ROTATION[safeIndex];

    // Step B: Update DB (Global Set)
    await Song.updateMany({}, { is_selected: false });
    await Song.updateMany(
        { short_code: { $in: selectedShortCodes } },
        { is_selected: true }
    );

    // Step C: Increment Index
    state.value = (currentIndex + 1) % FIXED_ROTATION.length;
    await state.save();

    const newSelection = await Song.find({ is_selected: true });
    return ApiResponse(res, 200, 'Global Shuffle (Evil) Executed', newSelection);
};

// Internal Helper: Random Saint Shuffle (Local Only, No DB Update)
const randomShuffleInternal = async (req, res) => {
    // Select 5 random songs per language using Aggregation
    // This allows randomness without updating database flags
    const distinctLanguages = await Song.distinct('language');
    let randomSongs = [];

    for (const lang of distinctLanguages) {
        const sample = await Song.aggregate([
            { $match: { language: lang } },
            { $sample: { size: 5 } }
        ]);
        randomSongs = [...randomSongs, ...sample];
    }
    
    return ApiResponse(res, 200, 'Local Shuffle (Random) Executed', randomSongs);
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

        if (!songUpload) {
             console.error("Cloudinary upload failed: Response was null");
             return ApiResponse(res, 500, 'Failed to upload song file');
        }

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
        console.error("Error in addSong:", err); // Log full error details
        
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
