FROM ghcr.io/puppeteer/puppeteer:latest

COPY package.json .
COPY package-lock.json .
RUN npm install-clean

COPY . .

CMD [ "node", "index.js" ]
