FROM node:24-bookworm as base

# Ensuring that all npm packages and commands are executed with a non-root user
USER node

ENV APP_PATH=/home/node/app

RUN mkdir -p $APP_PATH
WORKDIR $APP_PATH

FROM base as development
USER node