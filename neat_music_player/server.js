const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors'); // Import the cors middleware
const app = express();
const PORT = 3000;

// Serve static files from 'backing_tracks' directory
app.use('/tracks', express.static(path.join(__dirname, 'assets/backing_tracks')));

const corsOptions = {
    origin: 'http://localhost:56329',
};
// Enable CORS middleware
app.use(cors(corsOptions)); // Use cors middleware to allow all origins

// Function to get list of MP3 files in a directory
const getMp3Files = (dir, baseDir = '', files = []) => {
    fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file);
        const relativePath = path.join(baseDir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getMp3Files(filePath, relativePath, files);
        } else if (filePath.endsWith('.mp3')) {
            files.push({
                name: file,
                relativePath: relativePath,
                fullPath: filePath
            });
        }
    });
    return files;
};

// Endpoint to list MP3 files
app.get('/api/tracks', (req, res) => {
    const tracks = getMp3Files(path.join(__dirname, 'assets/backing_tracks')).map(file => ({
        name: file.name,
        path: `http://localhost:${PORT}/tracks/${encodeURIComponent(file.relativePath)}`,
        relativePath: file.relativePath
    }));
    res.json(tracks);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
