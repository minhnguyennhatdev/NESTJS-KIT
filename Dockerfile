FROM node:18-alpine

LABEL boybetby <boybetby@gmail.com>

ARG PORT=3000
ARG DOCKER_IMAGE_NAME=demo-service

# Create app directory
RUN mkdir -p /usr/src/${DOCKER_IMAGE_NAME}
WORKDIR /usr/src/${DOCKER_IMAGE_NAME}

# Install app dependencies
COPY package.json yarn.lock /usr/src/${DOCKER_IMAGE_NAME}/
RUN yarn install --frozen-lockfile --non-interactive --cache-folder .yarn-cache

# Bundle app source
COPY . /usr/src/${DOCKER_IMAGE_NAME}

RUN yarn build

EXPOSE ${PORT}
CMD [ "yarn", "start" ]
