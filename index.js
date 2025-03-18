const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4000;

const publicDir = path.join(__dirname, 'public');
const downloadsDir = path.join(__dirname, 'downloads');

// Ensure required directories exist
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}
if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicDir));

app.post('/download', (req, res) => {
    const { url, quality } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }
    
    const formatOption = quality && quality.trim() !== '' ? quality.trim() : 'bestvideo+bestaudio/best';
    const outputPath = path.join(downloadsDir, 'video.mp4');
    const command = `python3 yt-dlp-master/yt-dlp -f "${formatOption}" --merge-output-format mp4 -o "${outputPath}" "${url}"`;
    
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('Download error:', stderr);
            return res.status(500).json({ error: stderr });
        }
        res.json({ success: true, file: '/downloads/video.mp4' });
    });
});

app.use('/downloads', express.static(downloadsDir));

// Serve index.html for the root route
// Change this line:
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
