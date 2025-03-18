const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4000;

const publicDir = path.join(__dirname, 'public');
const downloadsDir = path.join(__dirname, 'downloads');
const cookiesPath = path.join(__dirname, 'all_cookies.txt'); // Ensure this file exists in the root

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

// Helper function to validate YouTube URLs
function isValidYouTubeUrl(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be');
    } catch (e) {
        return false;
    }
}

app.post('/download', (req, res) => {
    const { url, quality } = req.body;

    if (!url || !isValidYouTubeUrl(url)) {
        return res.status(400).json({ error: 'Invalid YouTube URL provided' });
    }

    const formatOption = quality && quality.trim() !== '' ? quality.trim() : 'bestvideo+bestaudio/best';
    const timestamp = Date.now();
    const outputPath = path.join(downloadsDir, `video-${timestamp}.mp4`);

    // Check if cookies file exists
    const ytDlpArgs = [
        '-f', formatOption,
        '--merge-output-format', 'mp4',
        '-o', outputPath,
        url
    ];

    if (fs.existsSync(cookiesPath)) {
        ytDlpArgs.unshift('--cookies', cookiesPath);
    } else {
        console.warn('Warning: Cookies file not found, some videos may not download.');
    }

    console.log(`Executing yt-dlp command: yt-dlp ${ytDlpArgs.join(' ')}`);

    const downloadProcess = spawn('yt-dlp', ytDlpArgs);

    let stderrData = '';

    downloadProcess.stderr.on('data', (data) => {
        stderrData += data.toString();
        console.error(`stderr: ${data.toString()}`);
    });

    downloadProcess.on('close', (code) => {
        console.log(`Download process exited with code ${code}`);

        if (code !== 0) {
            console.error('Download failed:', stderrData);
            return res.status(500).json({ error: stderrData || 'Download failed' });
        }

        if (fs.existsSync(outputPath)) {
            const relativePath = `/downloads/video-${timestamp}.mp4`;
            console.log(`Download successful: ${relativePath}`);
            res.json({ success: true, file: relativePath });
        } else {
            console.error('Download completed but file not found');
            res.status(500).json({ error: 'Download completed but file not found' });
        }
    });
});

app.use('/downloads', express.static(downloadsDir));

app.get('/', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
