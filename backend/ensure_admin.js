const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const ensureAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        const email = 'admin@gmail.com';
        const password = 'admin123';
        const username = 'AdminUser';

        let user = await User.findOne({ email });

        if (user) {
            console.log(`User ${email} already exists.`);
            // Optional: Reset password if you want to be sure
            // user.password = password; 
            // await user.save();
            // console.log('Password reset to:', password);
        } else {
            user = await User.create({
                username,
                email,
                password
            });
            console.log(`Created new Admin user: ${email}`);
        }

        console.log('You can login with:');
        console.log('Email:', email);
        console.log('Password:', password);
        
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

ensureAdmin();
