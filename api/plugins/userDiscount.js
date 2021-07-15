const config = require('../../config');
const db = config.db;
const Tools = require('../../tools');


async function list(token, body, query, params){
  try {

    if(token.platform !== 2 && token.platform !== 3){
      throw { code: 'PLATFORM_ERROR' }
    }

    let filter = JSON.parse(JSON.stringify(query)), result={}, amount={}, shopFilter = {}, shopPublic_id, activityPublic_id;

    if(filter.shop_category) {
      shopFilter['shop.category'] = filter.shop_category;
      delete filter.shop_category;
    }
    
    let orderCriteria = {
      field: 'user_discount.id',
      condition: 'asc'
    };

    if(query.sort) {
      let tmp = query.sort.split(' ');
      orderCriteria.field = 'user_discount.' + tmp[0];
      orderCriteria.condition = tmp[1];
    }

    if(query.search){
      var search = '%' + query.search + '%';
    }

    if(token.platform == 2 && query.activity_public_id) {
      activityPublic_id = query.activity_public_id;
    }
    
    if(token.platform == 3 && query.shop_public_id) {
      shopPublic_id = query.shop_public_id;
    }

    if(token.platform == 3 && token.id) {
      filter.user_id = token.id;
    }else if (token.platform == 2 && token.shop_id) {
      filter.shop_id = token.shop_id;
    }

    delete filter.limit;
    delete filter.offset;
    delete filter.sort;
    delete filter.search;
    delete filter.shop_public_id;
    delete filter.activity_public_id;
    
    Object.keys(filter).map(e => {
      switch(e) {
        case 'class':
          filter['activity.' + e] = filter[e]; delete filter[e];
          break;
        default:
          filter['user_discount.' + e] = filter[e]; delete filter[e];
      }
    });

    let limit = query.limit || 10;
    let offset = query.offset || 0;

    let totalQueryRaw = db('user_discount')
      .count('user_discount.id')
      .innerJoin('shop', 'user_discount.shop_id', 'shop.id')
      .innerJoin('activity', 'user_discount.activity_id', 'activity.id')
      .innerJoin('user', 'user_discount.user_id', 'user.id')
      .where(filter)
      .andWhere(shopFilter);

    let dataQueryRaw = db('user_discount').limit(limit).offset(offset)
      .select('user_discount.*', 'activity.class as activity_class' ,'shop.name as shop_name',  'shop.logo as shop_logo', 
      'picture.url as picture_url', 'user.name as user_name', 'user.email as user_email')
      .innerJoin('shop', 'user_discount.shop_id', 'shop.id')
      .innerJoin('activity', 'user_discount.activity_id', 'activity.id')
      .innerJoin('user', 'user_discount.user_id', 'user.id')
      .orderBy(orderCriteria.field, orderCriteria.condition)
      .leftJoin('picture', function(){
        this.on('picture.discount_id', 'user_discount.discount_id')
        this.andOn('picture.type', 1)
        this.andOn('picture.id', db.raw('(select min(id) from picture where picture.discount_id = user_discount.discount_id )'))
      })
      .where(filter)
      .andWhere(shopFilter);

    if(shopPublic_id) {
      totalQueryRaw.andWhere('shop.public_id', shopPublic_id);
      dataQueryRaw.andWhere('shop.public_id', shopPublic_id);
    }

    if(activityPublic_id) {
      totalQueryRaw.andWhere('activity.public_id', activityPublic_id);
      dataQueryRaw.andWhere('activity.public_id', activityPublic_id);
    }

    if(token.platform == 3) {
      totalQueryRaw.andWhere(function() {
        this.whereNull('user_discount.end_time').orWhere('user_discount.end_time', '>', new Date())});
      dataQueryRaw.andWhere(function() {
        this.whereNull('user_discount.end_time').orWhere('user_discount.end_time', '>', new Date())});
    }

    amount = query.search ? await totalQueryRaw.andWhere(function() {
      this.where('user_discount.discount_name', 'like', search).orWhere('shop.name', 'like', search);
    }) : await totalQueryRaw;
    
    result.total = parseInt(amount[0].count);

    result.data = query.search ? await dataQueryRaw.andWhere(function() {
      this.where('user_discount.discount_name', 'like', search).orWhere('shop.name', 'like', search);
    }) : await dataQueryRaw;

    return {
      body: result 
    };

  } catch (err) {
    console.log(`userDiscount.list error: `, err);
    throw { body: err };
  }
}

async function update(token, body, query, params){
  try {

    if(token.platform !== 3){
      throw { code: 'PLATFORM_ERROR' }
    }

    if(!params.id) {
      throw { code: 'ID_UNDEFINED' }
    }

    try {
      await db.transaction(async trx => {
        let userDiscount = await db('user_discount')
        .where({ id: params.id, user_id: token.id, status: 0 })
        .whereNull('use_time')
        .andWhere(function(){
          this.whereNull('start_time').orWhere('start_time', '<', new Date())
        })
        .andWhere(function(){
          this.whereNull('end_time').orWhere('end_time', '>', new Date())
        })
        .update({ use_time: new Date(), status: 1 }).transacting(trx).returning('*');
  
        await knexUpsert(trx, 'activity_log', ['activity_id', 'type', 'year', 'month', 'day'], Tools.getActLog(userDiscount[0].activity_id, userDiscount[0].shop_id));
        await db('discount').where({ id: userDiscount[0].discount_id }).increment({ usage_amount: 1}).transacting(trx);
        await db('activity').where({ id: userDiscount[0].activity_id }).increment({ usage_amount: 1}).transacting(trx);
        await db('activity_log').where(Tools.getActLog(userDiscount[0].activity_id, userDiscount[0].shop_id)).increment({ usage_amount: 1}).transacting(trx);
      });
    } catch(e) {
      throw { code: 'UPDATE_DISCOUNT_FAILED'}
    }

    return {
      body: { status: 1 }
    };

  } catch (err) {
    console.log(`userDiscount.update error: `, err);
    throw { body: err };
  }
}

async function find(token, body, query, params){
  try {

    if(token.platform !== 3){
      throw { code: 'PLATFORM_ERROR' }
    }

    if(!params.id) {
      throw { code: 'ID_UNDEFINED' }
    }

    let userDiscount = await db('user_discount').where({ id: params.id, user_id: token.id });

    if(userDiscount.length < 1){
      throw { code: 'USER_DISCOUNT_NOT_EXISTS' }
    }

    userDiscount = userDiscount[0];

    let shopInfo = await db('shop').where({ id: userDiscount.shop_id});
    let activityInfo = await db('activity').where({ id: userDiscount.activity_id});
    let discountInfo = await db('discount').where({ "discount.id": userDiscount.discount_id})
    .select('discount.*', 'picture.url as picture_url')      
    .leftJoin('picture', function(){
      this.on('picture.discount_id', 'discount.id')
      this.andOn('picture.type', 1)
      this.andOn('picture.id', db.raw('(select min(id) from picture where picture.discount_id = discount.id)'))
    });

    if(shopInfo.length < 1){
      throw { code: 'SHOP_NOT_EXISTS' }
    }

    userDiscount.shop_info = shopInfo[0];
    userDiscount.discount_info = discountInfo[0];
    userDiscount.activity_info = activityInfo[0];

    return {
      body: userDiscount
    };

  } catch (err) {
    console.log(`userDiscount.find error: `, err);
    throw { body: err };
  }
}

async function writeoff(token, body, query, params){
  try {

    if(token.platform !== 2){
      throw { code: 'PLATFORM_ERROR' }
    }

    let userDiscount = await db('user_discount').where({ shop_id: token.shop_id, code: body.user_discount_code });

    if(userDiscount.length > 1){
      throw { code: 'USER_DISCOUNT_DUPLICATE'} 
    }    
    if(userDiscount.length < 1){
      throw { code: 'USER_DISCOUNT_NOT_EXISTS'} 
    }    

    userDiscount = userDiscount[0];

    if(userDiscount.status || userDiscount.use_time ) {
      throw { code: 'DISCOUNT_USE_FAILED' }
    }

    if(userDiscount.start_time && userDiscount.end_time) {
      if(new Date() < userDiscount.start_time || new Date() > userDiscount.end_time) {
        throw { code: 'DISCOUNT_USE_FAILED' }
      }
    }

    let updateDiscount = {
      use_time: new Date(),
      status: 1
    }

    //判斷是否有帶分店public_id
    if(body.shop_branch_public_id) {
      let shopBranch = await db('shop_branch').where({ public_id: body.shop_branch_public_id, status: 1 });
      if(shopBranch.length > 1){
        throw { code: 'SHOP_BRANCH_DUPLICATE' }
      }
      if(shopBranch.length < 1){
        throw { code: 'SHOP_BRANCH_NOT_EXISTS' }
      }
      updateDiscount.writeoff_shop_branch_id = shopBranch[0].id;
    }

    await db('user_discount')
      .where({ id: userDiscount.id, status: 0 })
      .whereNull('use_time')
      .andWhere(function(){
        this.whereNull('start_time').orWhere('start_time', '<', new Date())
      })
      .andWhere(function(){
        this.whereNull('end_time').orWhere('end_time', '>', new Date())
      })
      .update(updateDiscount); 

    return {
      body: 'OK'
    };

  } catch (err) {
    console.log(`userDiscount.writeoff error: `, err);
    throw { body: err };
  }
}

async function knexUpsert(trx, tableName, key, data, doThing='NOTHING') {
  try {
    console.log('data', data)

    return await db.raw(
      `? ON CONFLICT (${key.join(',')}) DO ${doThing} RETURNING *;`,
      [db(tableName).insert(data)]
    ).transacting(trx);
  } catch(e) {
    console.log(e);
    throw { code: `CREATE ${tableName.toUpperCase()} FAILED` }
  }
}

module.exports = {
  list,
  find,
  update,
  writeoff
};