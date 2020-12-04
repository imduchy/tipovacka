FROM node:12-alpine3.10

# create destination directory
RUN mkdir -p /usr/src/tipovacka
WORKDIR /usr/src/tipovacka

# update and install dependencies
RUN apk update && apk upgrade
RUN apk add git

# https://docs.microsoft.com/en-us/azure/app-service/configure-custom-container?pivots=container-linux#enable-ssh
RUN apk add openssh \
     && echo "root:Docker!" | chpasswd 
COPY sshd_config /etc/ssh/

# copy the app, note .dockerignore
COPY . /usr/src/tipovacka/
RUN npm install
RUN npm run build

EXPOSE 3000
EXPOSE 80 2222

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

ENTRYPOINT [ "startup.sh" ]