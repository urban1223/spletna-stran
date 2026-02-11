FROM node:22.17.0

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

# Build-time environment variable for Vite
ARG VITE_WEB3FORMS_ACCESS_KEY
ENV VITE_WEB3FORMS_ACCESS_KEY=$VITE_WEB3FORMS_ACCESS_KEY
ENV PORT=8080

RUN npm run build

CMD ["npm", "run", "serve"]
