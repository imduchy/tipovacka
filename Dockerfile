FROM appsvc/node:12-lts_20200522.6

# create destination directory
RUN mkdir -p /usr/src/tipovacka
WORKDIR /usr/src/tipovacka

# update and install dependencies
RUN apk update && apk upgrade
RUN apk add git

# copy the app, note .dockerignore
COPY . /usr/src/tipovacka/
RUN npm install
RUN npm run build

EXPOSE 3000

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

CMD ["npm" "start"]