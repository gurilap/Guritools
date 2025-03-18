FROM node:latest

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

# Create directories and move the HTML file to public directory
RUN mkdir -p public downloads
RUN cp index.html public/

EXPOSE 4000
CMD ["node", "index.js"]