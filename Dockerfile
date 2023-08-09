FROM node:20.5

RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    sh -c 'echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
    apt-get update && apt --fix-broken install && apt-get install google-chrome-stable -y
RUN groupadd -r muggles && useradd -r -g muggles muggle
WORKDIR /opt

COPY package.json .
COPY package-lock.json .
RUN npm install-clean

COPY . .

USER muggle
CMD [ "node", "index.js" ]