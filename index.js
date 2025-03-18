const express = require("express");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 4000;

const publicDir = path.join(__dirname, "public");
const downloadsDir = path.join(__dirname, "downloads");

// Ensure required directories exist
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicDir));

// Helper function to validate YouTube URL
function isValidYouTubeUrl(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.includes("youtube.com") || urlObj.hostname.includes("youtu.be");
    } catch {
        return false;
    }
}

app.post("/download", (req, res) => {
    const { url, quality } = req.body;

    if (!isValidYouTubeUrl(url)) {
        return res.status(400).json({ error: "Invalid YouTube URL provided" });
    }

    const formatOption = quality ? quality.trim() : "bestvideo+bestaudio/best";
    const timestamp = Date.now();
    const outputPath = path.join(downloadsDir, `video-${timestamp}.mp4`);

    // Command to download with cookies
    const ytDlpArgs = [
        "-f", formatOption,
        "--merge-output-format", "mp4",
        "--cookies-from-browser", "chrome",
        "-o", outputPath,
        url
    ];

    console.log("Executing command:", ["yt-dlp", ...ytDlpArgs].join(" "));

    const downloadProcess = spawn("yt-dlp", ytDlpArgs);

    let stderrData = "";

    downloadProcess.stderr.on("data", (data) => {
        stderrData += data.toString();
        console.error("stderr:", data.toString());
    });

    downloadProcess.on("close", (code) => {
        if (code !== 0) {
            console.error("Download failed:", stderrData);
            return res.status(500).json({ error: stderrData || "Download failed" });
        }

        if (fs.existsSync(outputPath)) {
            res.json({ success: true, file: `/downloads/video-${timestamp}.mp4` });
        } else {
            res.status(500).json({ error: "Download completed but file not found" });
        }
    });
});

app.use("/downloads", express.static(downloadsDir));

app.get("/", (req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
