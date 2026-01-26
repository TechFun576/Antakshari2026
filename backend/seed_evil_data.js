const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Song = require('./src/models/Song');
const { FIXED_ROTATION } = require('./src/config/riggedSets');

dotenv.config();

const seedEvilData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding...');

        // Flatten the rotation array to get all unique short codes needed
        const allShortCodes = [...new Set(FIXED_ROTATION.flat())];
        
        console.log(`Found ${allShortCodes.length} short codes to ensure exist in DB.`);

        let createdCount = 0;

        for (const code of allShortCodes) {
            // Check if song already exists with this short code
            const exists = await Song.findOne({ short_code: code });
            
            if (!exists) {
                // Infer language from first letter
                let language = 'English';
                if (code.startsWith('H')) language = 'Hindi';
                if (code.startsWith('B')) language = 'Bengali';

                await Song.create({
                    song_name: `Dummy Song ${code}`,
                    artist: 'Evil Logic Artist',
                    album: 'Rigged Album',
                    language: language,
                    short_code: code,
                    intro_audio_url: 'https://res.cloudinary.com/demo/video/upload/v1689123456/sample_audio.mp3', // valid dummy url
                    lyrics_link: 'https://example.com/lyrics',
                    is_selected: false
                });
                createdCount++;
                // console.log(`Created dummy song for: ${code}`);
            }
        }

        console.log(`\nSeeding Complete! Created ${createdCount} new dummy songs.`);
        console.log(`You can now test the Shuffle button on the frontend.`);
        
        process.exit();
    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedEvilData();
