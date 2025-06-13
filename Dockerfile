FROM node:20

WORKDIR /app

COPY proxy.js .

RUN npm install ws

EXPOSE 8080

CMD ["node", "proxy.js"]
