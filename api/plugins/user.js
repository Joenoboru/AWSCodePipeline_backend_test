const config = require('../../config');
const Tools = require('../../tools');
const uuidv1 = require('uuid/v1');
const jwt = require('jsonwebtoken');
const db = config.db;
const AWS = require('aws-sdk');
const moment = require('moment');
const xlsx = require('xlsx');

const miracolo = config.miracolo;

async function login(token, body, query, params){
  try {

    let { code } = body;

    let miracoloUserInfo = await getMiracoloUserInfo(code, 'web');

    let user = await db('user').where({ type: 3, miracolo_id: miracoloUserInfo.public_id });

    if( user.length ){
      // user login
      user = user[0];

    } else {
      // user create
      user = await create({
        type: 3,
        status: 1,
        miracolo_id: miracoloUserInfo.public_id,
        name: miracoloUserInfo.name || '',
        picture: miracoloUserInfo.picture || '',
        email: miracoloUserInfo.email || ''
      })
      user = user[0];
    }

    let expireTime = new Date().getTime() + config.jwtExpireTimeForUser;

    let payload = {
      id: user.id,
      type: user.type,
      platform: token.platform,
      exp : parseInt(expireTime / 1000, 10)
    };

    let tokenInfo = jwt.sign(payload, config.jwtSecret);

    return {
      body: {
        public_id: user.public_id,
        token: tokenInfo,
        expire_time: new Date(expireTime)
      }
    };

  } catch (err) {
    console.log(`user.login error: `, err);
    throw { body: err };
  }
}

async function update(token, body, query, params){
  try {

    if(!params.public_id) {
      throw { code: 'PUBLICID_UNDEFINED' }
    }

    let user = await db('user').where({ id: token.id, public_id: params.public_id, type: 3 }).update(body).returning('*');

    if(user.length > 1){
      throw { code: 'USER_DUPLICATE' }
    }

    if(user.length < 1){
      throw { code: 'USER_NOT_EXISTS' }
    }

    return {
      body: user[0]
    };

  } catch (err) {
    console.log(`user.update error: `, err);
    throw { body: err };
  }
}

async function find(token, body, query, params){
  try {

    if(!params.public_id) {
      throw { code: 'PUBLICID_UNDEFINED' }
    }

    let user;

    if(token.platform !== 2 && token.platform !== 3 ){
      throw { code: 'PLATFORM_ERROR' }
    }

    if(token.platform == 3 && token.id) {
      user = await db('user').where({ id: token.id, public_id: params.public_id, type: 3 });
    }else if(token.platform == 2 && token.shop_id){
      user = await db('user').innerJoin('user_subscribe', 'user.id', 'user_subscribe.user_id')
      .where({"user.public_id": params.public_id, "user.type": 3, "user_subscribe.shop_id": token.shop_id});
    }

    if(user.length > 1){
      throw { code: 'USER_DUPLICATE' }
    }

    if(user.length < 1){
      throw { code: 'USER_NOT_EXISTS' }
    }

    if(query.requestUserToken && token.platform == 3) {
      user[0].user_token = await Tools.encodeUserToken(config.userTokenSecret, user[0].id, new Date().getTime()+ 15*60*1000);
    }
    
    return {
      body: user[0]
    };

  } catch (err) {
    console.log(`user.find error: `, err);
    throw { body: err };
  }
}

async function create(userInfo){
  try {
    let user;
    try { 
      await db.transaction(async trx => { 
        userInfo.public_id = uuidv1();
        user = await db('user').insert(userInfo).transacting(trx).returning('*');
        let code = await Tools.generateCode(config.codeSecret, user[0].id, 'U');
        user = await db('user').where({ id: user[0].id }).update({ code: code }).transacting(trx).returning('*');
      });
    }
    catch(e) {
      console.log(e);
      throw { code: 'CREATE_USER_FAILED' };
    }
    return user;
  } catch (err) {
    console.log(err);
    throw { code: 'user.create failed' };
  }
}

async function getMiracoloUserInfo(code, domain){
  try {

    let appInfo;
    switch(domain) {
      case 'admin':
        appInfo = miracolo.adminAppInfo;
      break;
      case 'web':
        appInfo = miracolo.webAppInfo;
      break;
    }
    let { token, expire_time } = await Tools.request({
      method: 'GET',
      jsonParse: true,
      url: `${miracolo.protocol}://${miracolo.api}/OAuth/token?`
        +`grant_type=${appInfo.grantType}&`
        +`client_id=${appInfo.clientId}&`
        +`client_secret=${appInfo.clientSecret}&`
        +`scope=${appInfo.scope}&`
        +`code=${code}`
    });

    let result = await Tools.request({
      method: 'GET',
      jsonParse: true,
      url: `${miracolo.protocol}://${miracolo.api}/OAuth/userInfo?`
        +`client_id=${appInfo.clientId}`,
      headers: { token }
    });

    if(!result.public_id){
      throw true;
    }

    return result

  } catch (err) {
    throw { code: 'GET_USER_INFO_FAILED' };
  }
}

async function list(token, body, query, params){
  try {

    if(token.platform !== 2){
      throw { code: 'PLATFORM_ERROR' }
    }

    let result={}, amount, usersData, search, area;

    let orderCriteria = {
      field: 'user.id',
      condition: 'asc'
    };

    let limit = query.limit || 10;
    let offset = query.offset || 0;

    function cSearch(){
      this.where('user.name', 'like', search)
      .orWhere('user.email', 'like', search)
      .orWhere('user.phone', 'like', search);
    }

    function aSearch(){
      this.where('user.city', 'like', area)
      .orWhere('user.address', 'like', area)
    }

    if(query.sort) {
      let tmp = query.sort.split(' ');
      orderCriteria.field = 'user.' + tmp[0];
      orderCriteria.condition = tmp[1];
    }

    if(query.search){
      search = '%' + query.search + '%';
    }

    if(query.area){
      area = '%' + query.area + '%';
    }

    let totalQueryRaw = db('user_subscribe')
    .count('user_subscribe.user_id')
    .innerJoin('user', 'user_subscribe.user_id', 'user.id')
    .where({shop_id: token.shop_id});

    let dataQueryRaw = db('user_subscribe').limit(limit).offset(offset)
    .select('user.public_id', 'user.name', 'user.gender', 
    'user.birth_year', 'user.birth_month', 'user.birth_day', 
    'user.email','user.city', 'user.address', 'user.phone', 'user.picture')
    .innerJoin('user', 'user_subscribe.user_id', 'user.id')
    .where({shop_id: token.shop_id})
    .orderBy(orderCriteria.field, orderCriteria.condition);

    if(search){
      totalQueryRaw.andWhere(cSearch);
      dataQueryRaw.andWhere(cSearch);
    }

    if(area){
      totalQueryRaw.andWhere(aSearch);
      dataQueryRaw.andWhere(aSearch);
    }

    if(query.gender){
      totalQueryRaw.andWhere(function() {
        this.where('user.gender', '=', query.gender)
      });
      dataQueryRaw.andWhere(function() {
        this.where('user.gender', '=', query.gender)
      });
    }

    amount = await totalQueryRaw;
    usersData = await dataQueryRaw;

    usersData.map(u => {
      u.birth_day = u.birth_year&&u.birth_month&&u.birth_day 
      ? moment([u.birth_year, u.birth_month-1, u.birth_day]).format('YYYY-MM-DD') 
      : '';
      delete u.birth_year;
      delete u.birth_month;
    })

    if(query.birth_day_start && query.birth_day_end){ 
      usersData = usersData.filter(u => {
        return new Date(query.birth_day_start) <= new Date(u.birth_day) && new Date(u.birth_day) <= new Date(query.birth_day_end)
      })
    }

    result.total = query.birth_day_start && query.birth_day_end 
    ? usersData.length 
    : parseInt(amount[0].count);
    result.data = usersData;

    return {
      body: result 
    };

  } catch (err) {
    console.log(`user.list error: `, err);
    throw { body: err };
  }
}

async function listExportExcel(token, body, query, params){
  try {

    if(token.platform !== 2){
      throw { code: 'PLATFORM_ERROR' }
    }

    let result={}, s3Key = `user_list_${token.shop_id}.csv`;

    let usersData = await db('user_subscribe')
    .select('user.name as First Name', 'user.name as Last Name', 'user.city as Country', 'user.email as Email', 'user.phone as Phone')
    .innerJoin('user', 'user_subscribe.user_id', 'user.id')
    .where({shop_id: token.shop_id})
    .orderBy('user.id', 'asc');

    usersData.map( u => {
      u.Zip = '';
    })

    function produceBuffer(json) {
      let jsonWorkSheet = xlsx.utils.json_to_sheet(json);

      let workBook = {
        SheetNames: ['jsonWorkSheet'],
        Sheets: {
          'jsonWorkSheet': jsonWorkSheet
        }
      };

      const wbOut = xlsx.write(workBook, {
        bookType: 'csv',
        type: 'buffer',
      });

      return wbOut;
    }

    function uploadtoS3(bucketKey, body) {

      AWS.config.update({
        region: config.s3Upload.region,
        accessKeyId: config.s3Upload.accessKeyId,
        secretAccessKey: config.s3Upload.secretAccessKey
      })

      const s3 = new AWS.S3();

      s3.putObject({
        Bucket: "summa-admin/userlistExcels",
        Key: bucketKey,
        ACL: 'public-read',
        Body: body,
        ContentType:
          'text/csv',
      },
      function(error) { 
        if (error) {
          throw { code: 'UPLOAD_FILE_FAIL' }
        }
      })
      return 'https://summa-admin.s3-ap-northeast-1.amazonaws.com/userlistExcels/' + bucketKey
    }

    let buffer = produceBuffer(usersData);

    result.url = uploadtoS3(s3Key, buffer);

    return {
      body: result
    }

    

  } catch (err) {
    console.log(`user.listExportExcel error: `, err);
    throw { body: err };
  }
}

module.exports = {
  login,
  find,
  update,
  getMiracoloUserInfo,
  list,
  listExportExcel
};