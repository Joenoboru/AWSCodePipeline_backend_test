const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = async function(ctx, next) {
  try {

    let token = ctx.cookies.get('x-miracolo@-authorization-token') || ctx.request.header.token;
    let domain = ctx.header.domain || ctx.header.origin || '';

    if( !token ) {

      let platform;

      if( domain.indexOf(config.domain.sysop) > -1 ){ // 從總管理者後台登入
        platform = 1
      }      

      if( domain.indexOf(config.domain.admin) > -1 ){ // 從組織管理者後台登入
        platform = 2
      }      

      if( domain.indexOf(config.domain.web) > -1 ){ // 從第三方使用者介面登入
        platform = 3
      }      
      
      let payload = {
       type: 4, // 1: admin, 2: shopOwner, 3: user, 4: visitor
       platform,
       rememberMe: true
      };

      token = jwt.sign(payload, config.jwtSecret);

    }

    ctx.token = jwt.verify(token, config.jwtSecret);

    switch(ctx.token.type){
      case 1:
        ctx.token.identity = 'admin'; // Admin
        break;
      case 2:
        ctx.token.identity = 'shopOwner'; // shopOwner
        break;
      case 3:
        ctx.token.identity = 'user'; // User
        break;
      default:
        ctx.token.identity = 'visitor' // Visitor
        break;
    }

    /**
      ctx.token:
        user_id,
        platform,
        type,
        identity,
        rememberMe
    */

    return next();

  }catch (err) {
    ctx.status = err.statusCode || err.status || 401;
    ctx.body = { code: 'TOKEN_INVALID'};
  }
  
}