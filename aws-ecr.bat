call yarn build
call aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin 943675632159.dkr.ecr.ap-northeast-1.amazonaws.com
call docker build -t 943675632159.dkr.ecr.ap-northeast-1.amazonaws.com/fm:%1 .
call docker tag wf_backend:latest 943675632159.dkr.ecr.ap-northeast-1.amazonaws.com/fm:%1
call yarn clean
call docker push 943675632159.dkr.ecr.ap-northeast-1.amazonaws.com/fm:%1
