FROM node:latest

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy the entire project files
COPY . .

# Ensure yt-dlp script has execution permissions
RUN chmod +x /app/yt-dlp-master/yt-dlp

# Create necessary directories
RUN mkdir -p public downloads
RUN cp index.html public/

EXPOSE 4000

CMD ["node", "index.js"]
