FROM node:15

WORKDIR /workspace

COPY package*.json ./
RUN npm install
COPY index.js ./

CMD [ "node", "index.js" ]
