const config = require('../../config');
const uuidv1 = require('uuid/v1');
const jwt = require('jsonwebtoken');
const db = config.db;
const User = require('./user');
const Tools = require('../../tools');
const geohash = require('ngeohash');
const xlsx = require('xlsx');
var AWS = require('aws-sdk');
const moment = require('moment');

async function login(token, body, query, params){
  try {
    if(token.platform !== 2){
      throw { code: 'PLATFORM_ERROR' }
    }

    let new_shop = true;

    let { code } = body;

    let miracoloUserInfo = await User.getMiracoloUserInfo(code, 'admin');
    let shop, user = await db('user').where({ type: 2, miracolo_id: miracoloUserInfo.public_id });

    if( user.length ){
      // shop login
      user = user[0];
      shop = await db('shop').where({ user_id: user.id });
      shop = shop[0];
      new_shop = false;

    } else {
      // shop create
      ({ user, shop } = await create({
        type: 2,
        status: 1,
        miracolo_id: miracoloUserInfo.public_id,
        name: miracoloUserInfo.name || '',
        picture: miracoloUserInfo.picture || '',
        email: miracoloUserInfo.email || ''
      }));
    }

    let expireTime = new Date().getTime() + config.jwtExpireTime ;

    let payload = {
      id: user.id,
      shop_id: shop.id,
      type: user.type,
      platform: token.platform,
      exp : parseInt(expireTime / 1000, 10)
    };

    let tokenInfo = jwt.sign(payload, config.jwtSecret);

    return {
      body:  {
        shop_public_id: shop.public_id,
        token: tokenInfo,
        expire_time: new Date(expireTime),
        new_shop
      }
    }

  } catch (err) {
    console.log(`shop.login error: `, err);
    throw { body: err };
  }
}

async function update(token, body, query, params){
  try {

    if(!params.public_id) {
      throw { code: 'PUBLICID_UNDEFINED' }
    }

    if(body.hasOwnProperty('latitude') && body.hasOwnProperty('longitude')){
      body.geohash = geohash.encode(body.latitude, body.longitude, 9)
    }

    let shop = await db('shop').where({ id: token.shop_id, public_id: params.public_id }).update(body).returning('*');

    if(shop.length > 1){
      throw { code: 'SHOP_DUPLICATE' }
    }

    if(shop.length < 1){
      throw { code: 'SHOP_NOT_EXISTS' }
    }

    return {
      body: shop[0]
    };

  } catch (err) {
    console.log(`shop.update error: `, err);
    throw { body: err };
  }
}

async function find(token, body, query, params){
  try {

    if(!params.public_id) {
      throw { code: 'PUBLICID_UNDEFINED' }
    }

    let shop = await db('shop').where({ id: token.shop_id, public_id: params.public_id });

    if(shop.length > 1){
      throw { code: 'SHOP_DUPLICATE' }
    }

    if(shop.length < 1){
      throw { code: 'SHOP_NOT_EXISTS' }
    }

    return {
      body: shop[0]
    };

  } catch (err) {
    console.log(`shop.find error: `, err);
    throw { body: err };
  }
}

async function create(user){
  try {

    let shop = {
      public_id: uuidv1(),
      name: '',
      status: 1,
      category: 0
    }

    user.public_id = uuidv1();

    await db.transaction(async trx => {
      user = await db('user').insert(user).transacting(trx).returning('*');
      shop.user_id = user[0].id;
      let code = await Tools.generateCode(config.codeSecret, user[0].id, 'U');
      await db('user').where({ id: user[0].id }).update({ code: code }).transacting(trx);
      shop = await db('shop').insert(shop).transacting(trx).returning('*');
    });

    user = user[0];
    shop = shop[0];

    return { user, shop };

  } catch (err) {
    console.log(err);
    throw { code: 'shop.create failed' };
  }
}

async function list(token, body, query, params){
  try {

    let filter = JSON.parse(JSON.stringify(query)), result={}, amount={}, shops=[], search, locCriteria=[];
    let latitude=25.034263, longitude=121.564553; // 若沒有目前地址，以101當預設地址

    let orderCriteria = {
      field: 'id',
      condition: 'asc'
    };

    if(filter.sort) {
      let tmp = filter.sort.split(' ');
      orderCriteria.field = tmp[0];
      orderCriteria.condition = tmp[1];
    }

    if(filter.search){
      search = '%' + filter.search + '%';
    }

    if( filter.hasOwnProperty('latitude') && filter.hasOwnProperty('longitude') ){
      // 用 geohash 找出附近商家
      latitude = filter.latitude;
      longitude = filter.longitude;

      var precision = ( parseInt(query.precision) ) ? filter.precision : 6;
      let nowGeohash = geohash.encode( latitude, longitude, precision )
      
      locCriteria.push( nowGeohash );
      locCriteria = locCriteria.concat( geohash.neighbors(nowGeohash) );
    }

    filter.status = 1;

    delete filter.limit;
    delete filter.offset;
    delete filter.sort;
    delete filter.search;
    delete filter.latitude;
    delete filter.longitude;
    delete filter.precision;

    let limit = query.limit || 10;
    let offset = query.offset || 0;

    function cSearch(){
      this.andWhere(function() {
        this.where('name', 'like', search).orWhere('description', 'like', search);
      })  
    }

    function cLocation(){
      this.andWhere(function() {
        for(let i=0; i<locCriteria.length; i++){
          this.orWhere('geohash', 'like', locCriteria[i]+'%')
        }
      })  
    }
    
    let amountRawQuery = db('shop').where(filter).count('id')
    let shopsRawQuery = db('shop').limit(limit).offset(offset)
      .orderBy(orderCriteria.field,orderCriteria.condition)
      .where(filter)

    if(orderCriteria.field === 'distance'){
      // calculate_distance 為自定義 function，可見 summa-documentation 的 migrationSQL.sql
      shopsRawQuery.select('*')
        .select( db.raw(`calculate_distance(${latitude}, ${longitude}, latitude, longitude, 'K') as distance`))
    }

    if(locCriteria.length){
      amountRawQuery.andWhere(cLocation)
      shopsRawQuery.andWhere(cLocation)
    }

    if(search){
      amountRawQuery.andWhere(cSearch)
      shopsRawQuery.andWhere(cSearch)
    }

    amount = await amountRawQuery;
    shops = await shopsRawQuery;

    return {
      body: {
        total: parseInt(amount[0].count),
        data: shops        
      } 
    };

  } catch (err) {
    console.log(`shop.list error: `, err);
    throw { body: err };
  }  
}

async function tempdashboard(token){
  try {
    let shopAmount = await db('shop').select('name', 'created_time');
    let res = {
      amount: shopAmount.length, 
      shopList : shopAmount
    };
    return { body: res };
  } catch (err) {
    console.log(err);
    throw { code: 'shop.tempdashboard failed' };
  }
}

async function excelExport(token, body, query, params){
  try {

    if(token.platform !== 2){
      throw { code: 'PLATFORM_ERROR' }
    }

    let result = {};
    let userData = await db('user_subscribe')
    .select('user.id', 'user.name', 'user.phone', 'user.email', 'user.birth_year', 'user.birth_month', 'user.birth_day as birthday', 'user.gender', 'user.address')
    .innerJoin('user', 'user_subscribe.user_id', 'user.id')
    .where({shop_id: token.shop_id, tmp_17fit: false})
    .orderBy('user.id', 'asc');

    let exportedIds = userData.map(r => {
      let id = r.id;
      r.birthday = r.birth_year&&r.birth_month&&r.birthday ? 
      moment([r.birth_year, r.birth_month-1, r.birthday]).format('YYYY-MM-DD') : '';
      r.gender = r.gender ? r.gender === 1 ? '男' : '女' : '無';
      delete r.birth_year;
      delete r.birth_month;
      delete r.id;
      return id;
    })

    let s3Key = `user_${moment().format('YYYYMMDDHHmmss')}_${exportedIds.length ? exportedIds[0] : null}_${exportedIds.length ? exportedIds[exportedIds.length - 1] : null}.xlsx`;

    await db.transaction(async trx => { 
      await db('user').whereIn('id', exportedIds).update({tmp_17fit: true}).transacting(trx);
      await db('export_log').insert({shop_id: token.shop_id, export_from: 'user'}).transacting(trx);
    });

    function produceBuffer(json) {
      let jsonWorkSheet = xlsx.utils.json_to_sheet(json);

      let workBook = {
        SheetNames: ['jsonWorkSheet'],
        Sheets: {
          'jsonWorkSheet': jsonWorkSheet
        }
      };

      const wbOut = xlsx.write(workBook, {
        bookType: 'xlsx',
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
        Bucket: "summa-admin/shopExcels",
        Key: bucketKey,
        ACL: 'public-read',
        Body: body,
        ContentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
      function(error) { 
        if (error) {
          throw { code: 'UPLOAD_FILE_FAIL' }
        }
      })
      return 'https://summa-admin.s3-ap-northeast-1.amazonaws.com/shopExcels/' + bucketKey
    }
    let buffer = produceBuffer(userData);

    result.url = uploadtoS3(s3Key, buffer);

    return {body: result}

  } catch (err) {
    console.log(`shop.excelExport error: `, err);
    throw { body: err };
  }  
}

async function userDiscountExport(token, body, query, params){
  try {

    if(token.platform !== 2){
      throw { code: 'PLATFORM_ERROR' }
    }

    if(!query.activity_public_id){
      throw { code: 'ACTIVITY_PUBLIC_ID_UNDEFINED' }
    }
    
    let result = {};
    let activity = await db('activity').where({shop_id: token.shop_id, public_id: query.activity_public_id});

    if(activity.length > 1){
      throw { code: 'ACTIVITY_DUPLICATE' }
    }

    if(activity.length < 1){
      throw { code: 'ACTIVITY_NOT_EXISTS' }
    }

    let userDiscountData = await db('user_discount')
    .select('user.id as user_id', 'user.email', 'user.phone', 'user_discount.id as user_discount_id', 'user_discount.start_time as start_date', 'user_discount.end_time as end_date')
    .innerJoin('user', 'user_discount.user_id', 'user.id')
    .where({'user_discount.shop_id': token.shop_id, 'user_discount.activity_id': activity[0].id, 'user_discount.tmp_17fit': false})
    .orderBy('user_discount_id', 'asc');

    //篩出所有user_discount_id, 為了將他們更新為{tmp_17fit: true};
    let exportedIds = userDiscountData.map(r => {
      let id = r.user_discount_id;
      delete r.user_discount_id;
      return id;
    })

    let s3Key = `contract_${moment().format('YYYYMMDDHHmmss')}_${exportedIds.length ? exportedIds[0] : null}_${exportedIds.length ? exportedIds[exportedIds.length - 1] : null}.xlsx`;

    //用user id來判斷是否為同一個user持有數張卷, 前提是該活動只發1種卷
    let uniqueUserDiscountData = [];
    userDiscountData.forEach(function(item){
      let i = uniqueUserDiscountData.findIndex(x => (x.user_id == item.user_id));
      if(i <= -1){
        item.remainder = 1;
        uniqueUserDiscountData.push(item);
      }else {
        uniqueUserDiscountData[i].remainder++;
      }
    });
    uniqueUserDiscountData.forEach( e => delete e.user_id);

    await db.transaction(async trx => { 
      await db('user_discount').whereIn('id', exportedIds).update({tmp_17fit: true}).transacting(trx);
      await db('export_log').insert({shop_id: token.shop_id, export_from: 'user_discount'}).transacting(trx);
    });
    

    function produceBuffer(json) {
      let jsonWorkSheet = xlsx.utils.json_to_sheet(json);

      let workBook = {
        SheetNames: ['jsonWorkSheet'],
        Sheets: {
          'jsonWorkSheet': jsonWorkSheet
        }
      };

      const wbOut = xlsx.write(workBook, {
        bookType: 'xlsx',
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
        Bucket: "summa-admin/shopExcels",
        Key: bucketKey,
        ACL: 'public-read',
        Body: body,
        ContentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
      function(error) { 
        if (error) {
          throw { code: 'UPLOAD_FILE_FAIL' }
        }
      })
      return 'https://summa-admin.s3-ap-northeast-1.amazonaws.com/shopExcels/' + bucketKey
    }

    let buffer = produceBuffer(uniqueUserDiscountData);

    result.url = uploadtoS3(s3Key, buffer);

    return {body: result}

  } catch (err) {
    console.log(`shop.userDiscountExport error: `, err);
    throw { body: err };
  }  
}

module.exports = {
  login,
  find,
  list,
  update,
  tempdashboard,
  excelExport,
  userDiscountExport
};