FROM node:10.13.0
ARG NPM_RUN_SCRIPT
ENV NPM_RUN_SCRIPT=${NPM_RUN_SCRIPT}
COPY . /summa-api/
WORKDIR  /summa-api/
RUN npm install
CMD npm run ${NPM_RUN_SCRIPT:-start}
