# mirai-workflow-backend

開發請以develop為主

開発の方は「develop」のブランチを利用してください。

## Install

```sh
$ npm install
```
## Config

請參照根目錄的default.env來建立.env檔案設定。

初期のコンフィグファイル(.envファイル)がありませんので、「default.env」を參照して、新しい「.env」ファイルを作成してください。

## Debug with workflow_frontend

```sh
$ npm run dev-backend
```

##  使用套件
- Express - 後端框架
- sequelize ORM
- socket.io - 及時通知等
- moment - 日期相關
- passport - 權限管理
- i18next - 多語系
- pdfmake - PDF產生
- exceljs - Excel檔案產生 (注意：原本的XLSX[sheetjs]，因為進階功能需要付費，所以不再使用)
- winston - LOG相關

## 目錄
### 常用目錄
- config - 設定
- common-database - 共通資料庫(含 model)
- domain-resouce - 客戶資料庫(含 model)
- controllers - Controller (route相關)
- helpers - 自訂函數庫
- migrations - migration相關 (目前此部分仍使用JS)
- pdf - PDF產生腳本
- route - 底層route
- services - 資料存取、處理、取得資料相關
- wf_common - 前後端共通模組
- types - typescript 型別定義

### 不常用目錄
- enums - 列舉
- fonts - 字型(產生PDF使用)
- kernel-console - console
- logger - LOG模組
- session - SESSION
- socketio - SOCKETIO
- passport - 權限相關
- views - 後端View (不使用)

### 佈署相關目錄
- docker-fm
- logs
- k8s 
- monitoring

### 輸出目錄
- files
- logger 

## About sequelize

建立mode

モデルファイルの作成

```sh
npx sequelize-cli model:generate --name YOUR_TABLE_NAME --attributes COL_NAME:INTEGER,COL_NAME2:STRING
```

以現存model建造table

今存在するモデルを使用して、tableを作成します


```sh
npx sequelize-cli db:migrate
```

修改model

modelの変更

```sh
npx sequelize-cli migration:generate --name migration-accounting_details-add-column
```

### 執行DB migration
yarn db-migration 

會參考.env或環境參數對各DB進行Talbe schema變更

Sequelize技術文件:

Sequelizeのドキュメント:

https://sequelize.org/master/manual/model-querying-basics.html


### Debug in vscode devcontainer
https://github.com/microsoft/vscode-remote-try-node
Press F1 and select the Remote-Containers: Open Folder in Container... command.

### remove build failed images
docker rmi $(docker images --filter “dangling=true” -q --no-trunc)


### build image
1. compile ts at backend folder
yarn build 
2. compile react code, move to front_end folder
yarn build
3. copy fronend build folder to backend public folder
4. docker-compose
docker-compose up --build



### use kompose
https://kubernetes.io/docs/tasks/configure-pod-container/translate-compose-kubernetes/
kompose convert -f <filepath>
kubectl apply -f <filepath>
kubectl delete -f <filepath>
kubectl describe svc <service-name>

auto scaling ...TBC
https://ithelp.ithome.com.tw/articles/10197046


#### K8S
solve hpa target unknown
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/download/v0.3.7/components.yaml

clear all k8s's service
kubectl.exe delete pod,service,hpa,deploy --all

start all wf-backend k8s service
kubectl.exe create -f .\wf-backend-deployment.yaml,.\wf-backend-hpa-v2.yaml,.\wf-backend-service.yaml 
stop all  wf-backend k8s service
kubectl.exe delete -f .\wf-backend-deployment.yaml,.\wf-backend-hpa-v2.yaml,.\wf-backend-service.yaml 



k8s update deployment
https://tachingchen.com/tw/blog/kubernetes-rolling-update-with-deployment/


#### docker env create
redis:
docker run --name redis -p 6379:6379 -d redis
in docker-fm folder
> docker-compose up --scale backend=2 -d
