FROM node:latest

# Install required dependencies
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

# Copy all files (including all_cookies.txt)
COPY . .

# Ensure public and downloads directories exist
RUN mkdir -p public downloads

# Copy index.html to the public directory
RUN cp index.html public/

# Expose port 4000
EXPOSE 4000

# Start the Node.js app
CMD ["node", "index.js"]
