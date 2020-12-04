FROM node:12-alpine3.10

# create destination directory
RUN mkdir -p /usr/src/tipovacka
WORKDIR /usr/src/tipovacka

# update and install dependencies
RUN apk update && apk upgrade
RUN apk add git

# https://docs.microsoft.com/en-us/azure/app-service/configure-custom-container?pivots=container-linux#enable-ssh
ENV SSH_PASSWD "root:Docker!"
RUN apk update && apk upgrade
RUN apk add git
RUN apk add openssh
RUN apk add dialog
RUN echo "$SSH_PASSWD" | chpasswd 

COPY sshd_config /etc/ssh/
COPY azure_startup.sh /usr/local/bin/

RUN chmod u+x /usr/local/bin/azure_startup.sh
EXPOSE 8000 2222

# copy the app, note .dockerignore
COPY . /usr/src/tipovacka/
RUN npm install
RUN npm run build

EXPOSE 3000

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

ENTRYPOINT [ "azure_startup.sh" ]