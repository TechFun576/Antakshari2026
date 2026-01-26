const express = require('express');
const songRoutes = require('./src/routes/songRoutes');
const app = express();

app.use('/api/songs', songRoutes);

console.log("Checking Routes for /api/songs:");
const stack = songRoutes.stack;
stack.forEach(r => {
    if (r.route && r.route.path) {
        console.log(Object.keys(r.route.methods), r.route.path);
    }
});
