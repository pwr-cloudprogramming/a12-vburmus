FROM node:18-alpine
WORKDIR /frontend
COPY public/ ./public/
COPY src/ ./src/
COPY package.json .
COPY package-lock.json .
RUN npm install
ENTRYPOINT ["npm", "start"]