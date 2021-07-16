FROM node:12.18.3-alpine
RUN apk add git
# ENV NODE_ENV production
WORKDIR /usr/src/app
COPY ["package.json", "npm-shrinkwrap.json*", "./"]
RUN yarn install --production --silient
COPY . .
# COPY ./docker.env ./.env
CMD [ "node", "./bin/www" ]
EXPOSE ${PORT}
HEALTHCHECK --start-period=30s --retries=10 --interval=30s --timeout=5s CMD node ./healthcheck.js