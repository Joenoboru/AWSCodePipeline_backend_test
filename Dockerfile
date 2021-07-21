FROM node:12.18.3-alpine





##舊的code##
#COPY ["package.json", "npm-shrinkwrap.json*", "./"]
#RUN yarn install --production --silient
#COPY . .
# COPY ./docker.env ./.env
#CMD [ "node", "./bin/www" ]
#EXPOSE ${PORT}
#HEALTHCHECK --start-period=30s --retries=10 --interval=30s --timeout=5s CMD node ./healthcheck.js