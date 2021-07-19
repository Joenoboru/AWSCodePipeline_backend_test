1. install aws cli
2. execute "aws configure"
https://docs.aws.amazon.com/zh_tw/cli/latest/userguide/cli-configure-quickstart.html#cli-configure-quickstart-creds
3. build docker image
aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin 943675632159.dkr.ecr.ap-northeast-1.amazonaws.com
yarn build
docker-compose build
docker tag wf_backend:latest 943675632159.dkr.ecr.ap-northeast-1.amazonaws.com/fm:1.1.0
docker push 943675632159.dkr.ecr.ap-northeast-1.amazonaws.com/fm:1.1.0
yarn clean








# 沒有做healthcheck的版本
docker pull 943675632159.dkr.ecr.ap-northeast-1.amazonaws.com/fm:1.0.27

docker stack deploy --with-registry-auth -c  