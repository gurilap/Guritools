FROM node:latest

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .  
RUN mkdir -p public downloads  

EXPOSE 3000
CMD ["node", "index.js"]
