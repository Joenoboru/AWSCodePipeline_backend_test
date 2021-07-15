const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const routes = require('./routes/index');
const logger = require('koa-logger');
const jwtAuth = require('./middleware/jwt');
const cors = require('@koa/cors');
const Router = require('koa-router');
const pjson = require('./package.json');
const app = new Koa();
var router = new Router();

router.get('/', (ctx, next) => {
  ctx.body = pjson.version;
});
app.use(router.routes());

app.use(logger());
app.use(cors());
app.use(bodyParser());
app.use(jwtAuth);
app.use(routes);
app.listen(3333);

