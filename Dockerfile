FROM node:latest

# Install Python, ffmpeg, and required dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
RUN chmod a+rx /usr/local/bin/yt-dlp

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy all files
COPY . .

# Copy the cookies file
COPY all_cookies.txt /app/all_cookies.txt

# Create required directories
RUN mkdir -p public downloads
RUN cp index.html public/

# Set permissions for cookies file
RUN chmod 644 /app/all_cookies.txt

# Expose port
EXPOSE 4000

# Start the app
CMD ["node", "index.js"]
