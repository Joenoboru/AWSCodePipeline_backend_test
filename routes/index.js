const Router = require('koa-router');
const routes = require('../config/routes');
const api = require('../api/index');
const validation = require('../middleware/validation');
const sanitize = require('../middleware/sanitize');

const router = new Router({
  prefix: '/v1/'
});
for( let key in routes ){
  for(let fnName in routes[key]){
    let fn = api[key][fnName];
    let plugin = routes[key][fnName];
    if(fn) {
      router[plugin.method](key + plugin.path, async(ctx, next) => {
        try{
          // 判斷 Type 是否有權限
          if( plugin.type && plugin.type.indexOf(ctx.token.type) < 0 ){
            throw { status: 401, body: { code: 'PERMISSION_DENIED'} }
          }
          // 判斷 Validation 是否合法
          ctx.request.body = await validation(key, fnName, ctx.token.identity, ctx.request.body);
          // Business Logic Function
          let data = await fn(ctx.token, ctx.request.body, ctx.query, ctx.params, ctx);
          ctx.status = data.status || 200;
          // 判斷 Sanitize 是否合法
          ctx.body = await sanitize(key, fnName, ctx.token.identity, data.body);
        }catch(e){
          console.error(e);
          ctx.status = e.status || 400;
          ctx.body = e.body;   
        }
      });
    }
  }
}

module.exports = router.routes();