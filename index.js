const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4000;

const publicDir = path.join(__dirname, 'public');
const downloadsDir = path.join(__dirname, 'downloads');
const ytDlpPath = path.join(__dirname, 'yt-dlp-master', 'yt-dlp'); // ✅ Correct path

// Ensure required directories exist
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}
if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
}

// ✅ Check if yt-dlp file exists
if (!fs.existsSync(ytDlpPath)) {
    console.error('❌ Error: yt-dlp script not found at', ytDlpPath);
}

// Middleware
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

    // ✅ Properly formatted command
    const command = `python3 "${ytDlpPath}" -f "${formatOption}" --merge-output-format mp4 -o "${outputPath}" "${url}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('❌ Download error:', stderr);
            return res.status(500).json({ error: stderr });
        }
        res.json({ success: true, file: '/downloads/video.mp4' });
    });
});

app.use('/downloads', express.static(downloadsDir));

// ✅ Fix: Corrected the path for index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});
