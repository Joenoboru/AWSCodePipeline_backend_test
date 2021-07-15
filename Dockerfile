FROM node:12.18.3-alpine
ENV NPM_RUN_SCRIPT=${NPM_RUN_SCRIPT}
COPY . /summa-api/
WORKDIR  /summa-api/
RUN npm install
CMD npm run ${NPM_RUN_SCRIPT:-start}
