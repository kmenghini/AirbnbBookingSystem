FROM node:carbon

WORKDIR /usr/src/server

COPY . .

RUN npm install

EXPOSE 8080

CMD [ "npm", "start" ]