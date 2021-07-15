FROM 143778326327.dkr.ecr.ap-northeast-1.amazonaws.com/node-10.13.0:latest
ARG NPM_RUN_SCRIPT
ENV NPM_RUN_SCRIPT=${NPM_RUN_SCRIPT}
COPY . /summa-api/
WORKDIR  /summa-api/
RUN npm install
CMD npm run ${NPM_RUN_SCRIPT:-start}
