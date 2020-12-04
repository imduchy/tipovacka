FROM node:12-alpine3.12

# create destination directory
RUN mkdir -p /usr/src/tipovacka
WORKDIR /usr/src/tipovacka

# update and install dependencies
RUN apk update && apk upgrade
RUN apk add git
RUN apk add openssh \
     && echo "root:Docker!" | chpasswd 

# ssh
COPY sshd_config /etc/ssh/
EXPOSE 80 2222

# copy the app, note .dockerignore
COPY . /usr/src/tipovacka/
RUN npm install
RUN npm run build

EXPOSE 3000

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

ENTRYPOINT ["bash", "azure_startup.sh"]