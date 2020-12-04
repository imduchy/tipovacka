FROM appsvc/node:12-lts_20200522.6

# create destination directory
RUN mkdir -p /usr/src/tipovacka
WORKDIR /usr/src/tipovacka

# copy the app, note .dockerignore
COPY . /usr/src/tipovacka/
RUN npm install
RUN npm run build

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000
ENV SSH_PORT 2222
ENV PM2HOME /pm2home
ENV PATH ${PATH}:/home/site/wwwroot

EXPOSE 3000
EXPOSE 2222

WORKDIR /home/site/wwwroot

ENTRYPOINT ["azure_startup.sh"]