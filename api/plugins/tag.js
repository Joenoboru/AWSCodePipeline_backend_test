const config = require('../../config');
const db = config.db;

async function create(token, body, query, params){
  try {

    if(token.platform !== 1 && token.platform !== 2){
      throw { code: 'PLATFORM_ERROR' }
    }

    let result;

    switch(token.type){
      case 1:
        body.shop_id = null;
        break;
      case 2:
        let tagCount = await db('tag').count().where({shop_id: token.shop_id, type: body.type});
        if(parseInt(tagCount[0].count, 10) >= 20) {
          throw { code: 'OVER_TAG_LIMIT' }
        }
        body.shop_id = token.shop_id;
        break;
      default:
        throw { code: 'PERMISSION_DENIED' }
    }

    // 2. 檢查name是否重複
    let checkTagName = await db('tag').where(body);
    if(checkTagName.length) {
      throw { code: 'TAG_ALREADY_EXIST' }
    }

    try {
      result =  await db('tag').insert(body).returning('*');
    } catch(e) {
      throw { code: 'CREATE_TAG_FAILED' }
    }

    return {
      body: result[0]
    };

  } catch (err) {
    console.log(`tag.create error: `, err);
    throw { body: err };
  }
}

async function list(token, body, query, params){
  try {

    if(token.platform !== 1 && token.platform !== 2){
      throw { code: 'PLATFORM_ERROR' }
    }

    let limit = query.limit || 10;
    let offset = query.offset || 0;
    let orderCriteria = {
      field: 'tag.id',
      condition: 'asc'
    };

    if(query.sort) {
      let tmp = query.sort.split(' ');
      orderCriteria.field = tmp[0];
      orderCriteria.condition = tmp[1];
    }

    let filter = {
      shop_id: token.type === 2 ? token.shop_id : null
    }

    if(query.type){
      filter.type = query.type;
    }

    let amount = await db('tag').count().where(filter);
    let tag = await db('tag').limit(limit).offset(offset)
      .orderBy(orderCriteria.field, orderCriteria.condition)
      .where(filter);

    return {
      body: {
        total: parseInt(amount[0].count),
        data: tag       
      }
    };

  } catch (err) {
    console.log(`tag.list error: `, err);
    throw { body: err };
  }
}

async function find(token, body, query, params){
  try {

    if(token.platform !== 1 && token.platform !== 2){
      throw { code: 'PLATFORM_ERROR' }
    }

    if(!params.id) {
      throw { code: 'TAG_ID_UNDEFINED' }
    }

    let filter = {
      id: params.id,
      shop_id: token.type === 2 ? token.shop_id : null
    }

    let tag = await db('tag').where(filter);

    if(tag.length > 1){
      throw { code: 'TAG_DUPLICATE' }
    }

    if(tag.length < 1){
      throw { code: 'TAG_NOT_EXISTS' }
    }

    return {
      body: tag[0]
    };

  } catch (err) {
    console.log(`tag.find error: `, err);
    throw { body: err };
  }
}

async function update(token, body, query, params){
  try {

    if(token.platform !== 1 && token.platform !== 2){
      throw { code: 'PLATFORM_ERROR' }
    }

    if(!params.id) {
      throw { code: 'TAG_ID_UNDEFINED' }
    }

    let result, tag = await db('tag').where({ id : params.id });

    if(tag.length > 1){
      throw { code: 'TAG_DUPLICATE' }
    }

    if(tag.length < 1){
      throw { code: 'TAG_NOT_EXISTS' }
    }

    tag = tag[0];
  
    //1. 檢查name是否重複
    let checkTagName = await db('tag').where({ shop_id: tag.shop_id, name: body.name, type: tag.type }).whereNotIn('id', [tag.id]);

    if(checkTagName.length) {
      throw { code: 'TAG_ALREADY_EXIST' }
    }

    let filter = {
      id: params.id,
      shop_id: tag.shop_id
    }

    //2. 更新tag
    try {
      result = await db('tag').where(filter).update(body).returning('*');
    } catch(e) {
      throw { code: 'TAG_UPDATE_FAILED' }
    }

    return {
      body: result[0]
    };

  } catch (err) {
    console.log(`tag.update error: `, err);
    throw { body: err };
  }
}

async function remove(token, body, query, params){
  try {

    if(token.platform !== 1 && token.platform !== 2){
      throw { code: 'PLATFORM_ERROR' }
    }

    if(!params.id) {
      throw { code: 'TAG_ID_UNDEFINED' }
    }

    let filter = {
      id: params.id,
      shop_id: token.type === 2 ? token.shop_id : null
    }

    let result = await db('tag').where(filter).del();

    if(!result) {
      throw { code: 'REMOVE_TAG_FAILED' }
    }

    return {
      body: 'OK'
    };

  } catch (err) {
    console.log(`tag.remove error: `, err);
    throw { body: err };
  }
}

module.exports = {
  create,
  list,
  find,
  update,
  remove
}