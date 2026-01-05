FROM node:22.17.0

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

ENV PORT=8080

RUN npm run build

CMD ["npm", "run", "serve"]
