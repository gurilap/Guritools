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

// Helper function to validate YouTube URL
function isValidYouTubeUrl(url) {
    if (!url) return false;
    
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be');
    } catch (e) {
        return false;
    }
}

app.post('/download', (req, res) => {
    const { url, quality } = req.body;
    
    // Validate URL
    if (!url || !isValidYouTubeUrl(url)) {
        return res.status(400).json({ error: 'Invalid YouTube URL provided' });
    }
    
    const formatOption = quality && quality.trim() !== '' ? quality.trim() : 'bestvideo+bestaudio/best';
    const timestamp = Date.now();
    const outputPath = path.join(downloadsDir, 'video-${timestamp}.mp4');
    
    // Using the globally installed yt-dlp
    const command = 'yt-dlp -f "${formatOption}" --merge-output-format mp4 -o "${outputPath}" "${url}"';
    
    console.log('Executing command: ${command}');
    
    console.log('Starting download for URL: ${url}');
    
    // Use spawn instead of exec to get real-time output
    const { spawn } = require('child_process');
    const downloadProcess = spawn('yt-dlp', [
        '-f', formatOption,
        '--merge-output-format', 'mp4',
        '-o', outputPath,
        url
    ]);
    
    let stdoutData = '';
    let stderrData = '';
    
    downloadProcess.stdout.on('data', (data) => {
        stdoutData += data.toString();
        console.log('stdout: ${data.toString()}');
    });
    
    downloadProcess.stderr.on('data', (data) => {
        stderrData += data.toString();
        console.error('stderr: ${data.toString()}');
    });
    
    downloadProcess.on('close', (code) => {
        console.log('Download process exited with code ${code}');
        
        if (code !== 0) {
            console.error('Download failed:', stderrData);
            return res.status(500).json({ error: stderrData || 'Download failed' });
        }
        
        // Check if file exists after download
        if (fs.existsSync(outputPath)) {
            const relativePath = '/downloads/video-${timestamp}.mp4';
            console.log('Download successful: ${relativePath}');
            res.json({ success: true, file: relativePath });
        } else {
            console.error('Download completed but file not found');
            res.status(500).json({ error: 'Download completed but file not found' });
        }
    });
});

app.use('/downloads', express.static(downloadsDir));

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(PORT, () => {
    console.log('Server is running on port ${PORT}');
});