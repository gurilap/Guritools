FROM node:latest

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .  
RUN mkdir -p public downloads  

EXPOSE 4000
CMD ["node", "index.js"]
