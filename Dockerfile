FROM node:latest

# Install Python and other dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp
RUN pip3 install yt-dlp

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

# Create directories and move the HTML file to public directory
RUN mkdir -p public downloads
RUN cp index.html public/

EXPOSE 4000
CMD ["node", "index.js"]