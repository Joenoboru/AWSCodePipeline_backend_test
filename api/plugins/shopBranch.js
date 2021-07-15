const config = require('../../config');
const uuidv1 = require('uuid/v1');
const db = config.db;

async function create(token, body, query, params){
  try {

    if(token.platform !== 2){
      throw { code: 'PLATFORM_ERROR' }
    }

    body.shop_id = token.shop_id;
    body.public_id = uuidv1();
    let shopBranch;

    try { 
      shopBranch = await db('shop_branch').insert(body).returning('*');
    }catch(e) {
      console.log(e);
      throw { code: 'CREATE_SHOP_BRANCH_FAILED' };
    }

    return {
      body: shopBranch[0]
    }
  }
  catch (err) {
    console.log(`shopBranch.create error: `, err);
    throw { body: err };
  }
}

async function list(token, body, query, params){
  try {

    if(token.platform !== 2){
      throw { code: 'PLATFORM_ERROR' }
    }

    let limit = query.limit || 10;
    let offset = query.offset || 0;

    let orderCriteria = {
      field: 'shop_branch.id',
      condition: 'asc'
    };

    if(query.sort) {
      let tmp = query.sort.split(' ');
      orderCriteria.field = tmp[0];
      orderCriteria.condition = tmp[1];
    }

    let filter = {
      shop_id: token.shop_id
    }

    let amount = await db('shop_branch').count().where(filter);
    let shopBranch = await db('shop_branch').limit(limit).offset(offset)
      .orderBy(orderCriteria.field, orderCriteria.condition)
      .where(filter);

    return {
      body: {
        total: parseInt(amount[0].count),
        data: shopBranch       
      }
    }
  }
  catch (err) {
    console.log(`shopBranch.list error: `, err);
    throw { body: err };
  }
}

async function update(token, body, query, params){
  try {
    
    if(token.platform !== 2){
      throw { code: 'PLATFORM_ERROR' }
    }

    if(!params.public_id) {
      throw { code: 'PUBLICID_UNDEFINED' }
    }

    let shop;
    
    try { 
      shop = await db('shop_branch').where({ shop_id: token.shop_id, public_id: params.public_id }).update(body).returning('*');
    }catch(e) {
      console.log(e);
      throw { code: 'UPDATE_SHOP_BRANCH_FAILED' };
    }

    return {
      body: shop[0]
    }
  }
  catch (err) {
    console.log(`shopBranch.update error: `, err);
    throw { body: err };
  }
}

module.exports = {
  create,
  list,
  update
};