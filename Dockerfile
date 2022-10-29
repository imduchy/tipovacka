FROM node:14-alpine

RUN mkdir -p /usr/tmp
RUN mkdir -p /usr/src
WORKDIR /usr/tmp

RUN apk update && apk upgrade
RUN apk add git

COPY . /usr/tmp

RUN npm install -g npm@latest
RUN npm install

ENV NODE_ENV=production
RUN npm run build-common
RUN npm run build --workspace=@tipovacka/api

RUN mv ./apps/api/dist/* /usr/src
WORKDIR /usr/src

RUN rm -rf ./tmp

EXPOSE 3003

RUN ls -al
CMD [ "node", "index.js" ]