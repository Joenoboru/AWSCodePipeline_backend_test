const config = require('../../config');
const uuidv1 = require('uuid/v1');
const db = config.db;
const Tools = require('../../tools');
const aws = require('../../lib/aws');
const ses = new aws.SES();
const sns = new aws.SNS();

async function list(token, body, query, params){
  try {

    let limit = query.limit || 10;
    let offset = query.offset || 0;

    let orderCriteria = {
      field: 'id',
      condition: 'desc'
    };

    let amount, notice;

    // shop
    if( token.type === 2 ){

      if(query.sort) {
        let tmp = query.sort.split(' ');
        orderCriteria.field = tmp[0];
        orderCriteria.condition = tmp[1];
      }

      amount = await db('notice').count('id')
        .where({ shop_id: token.shop_id });

      notice = await db('notice').limit(limit).offset(offset).select('*')
        .orderBy(orderCriteria.field, orderCriteria.condition)
        .where({ shop_id: token.shop_id })

    }

    // user
    if( token.type === 3 ){

      if(query.sort) {
        let tmp = query.sort.split(' ');
        orderCriteria.field = 'notice.' + tmp[0];
        orderCriteria.condition = tmp[1];
      }

      amount = db('user_notice').count('id')
        .innerJoin('notice', 'notice.id', 'user_notice.notice_id')
        .where({ 'notice.status': 1 , 'user_notice.user_id': token.id })

      notice = db('user_notice').limit(limit).offset(offset)
        .select('notice.*', 'user_notice.status as read')
        .innerJoin('notice', 'notice.id', 'user_notice.notice_id')
        .orderBy(orderCriteria.field, orderCriteria.condition)
        .where({ 'notice.status': 1, 'user_notice.user_id': token.id })

      if(query.read) {
        amount.where({ 'user_notice.status': query.read });
        notice.where({ 'user_notice.status': query.read });
      }

      amount = await amount;
      notice = await notice;

    }

    return {
      body: {
        total: parseInt(amount[0].count),
        data: notice        
      }
    };

  } catch (err) {
    console.log(`notice.list error: `, err);
    throw { body: err };
  }
}

async function find(token, body, query, params){
  try {
    
    let result;
    // shopOwner
    if(token.type === 2){
      result = await db('notice').where({ id: params.id, shop_id: token.shop_id })
    }

    // user
    if(token.type === 3){
      result = await db('user_notice')
        .select('notice.*', 'user_notice.status as read')
        .innerJoin('notice', 'notice.id', 'user_notice.notice_id')
        .where({ 'user_notice.user_id': token.id, 'notice.id': params.id, 'notice.status': 1 })
    }

    if( result.length !== 1){
      throw { code: 'NOTICE_UNDEFINED' }
    }

    result = result[0];

    return {
      body: result
    }

  } catch (err) {
    console.log(`notice.find error: `, err);
    throw { body: err };
  }
}

async function create(token, body, query, params){
  try {

    /** find the recipients **/
    let recps = body.recipient || {};
    let mode = body.mode || {};
    let result = { total: 0 };

    let userList = db('user').where({ 'user.status': 1, 'user_subscribe.status': 1 })
      .innerJoin('user_subscribe', 'user.id', 'user_subscribe.user_id')
      .where({ 'user_subscribe.shop_id': token.shop_id })
      .select('id', 'email')
    
    if( recps.user_public_ids && recps.user_public_ids.length > 0){
      userList = await userList
        .whereIn('user.public_id', recps.user_public_ids);
    } else if( recps.all ){
      userList = await userList;
    } else {
      throw { code: 'RECIPIENT_UNDEFINED' }
    }

    if(!userList.length){
      throw { code: 'RECIPIENT_UNDEFINED' }      
    }
    
    result.total = userList.length;

    /** If have to create Summa Notification **/
    if(mode.notice){

      try {
        await db.transaction(async trx => {

          // create notice
          let data = {
            title: body.title,
            content: body.content,
            shop_id: token.shop_id,
            status: 1
          }

          let notice = await db('notice').insert(data).transacting(trx).returning('*');

          // create user_notice
          let userNoticeList = userList.map( u => { 
            return { notice_id: notice[0].id, user_id: u.id, status: 0 }
          });

          await db('user_notice').insert(userNoticeList).transacting(trx);

        });
    
      } catch(e) {
        throw { code: 'CREATE_NOTICE_FAILED' }
      }

    }

    /** If have to send Email **/
    if(mode.email){
      let emails = userList.filter( ul => ul.email ).map( ul => ul.email);
      let params = await Tools.parseSESContent({
        sender: config.sender,
        title: body.title,
        content: body.content,
        emails: emails
      });
      ses.sendEmail(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data);           // successful response
      });
    }

    return {
      body: result
    };

  } catch (err) {
    console.log(`notice.create error: `, err);
    throw { body: err };
  }
}

async function update(token, body, query, params){
  try {
    
    let result;
    // shopOwner change content
    if(token.type === 2){
      
      let notice = await db('notice')
        .where({ shop_id: token.shop_id, id: params.id })
        .update({ title: body.title, content: body.content })
        .returning('*');

      if(notice.length < 1){
        throw { code: 'NOTICE_UNDEFINED' }
      }

      result = notice[0];
    }

    // Client change status
    if(token.type === 3){
      await db('user_notice')
        .where({ user_id: token.id, notice_id: params.id })
        .update({ status: body.read });

      result = 'OK';
    }

    return {
      body: result
    }

  } catch (err) {
    console.log(`notice.update error: `, err);
    throw { body: err };
  }
}

async function remove(token, body, query, params){
  try {
    
    if(token.type !== 2){
      throw { code: 'PERMISSION_DENINED' }
    }
    
    let notice = await db('notice').where({ shop_id: token.shop_id, id: params.id })

    if( notice.length !== 1 ){
      throw { code: 'NOTICE_UNDEFINED' }
    }

    await db.transaction(async trx => {

      await db('user_notice')
        .where({ notice_id: params.id })
        .del()
        .transacting(trx);

      await db('notice')
        .where({ shop_id: token.shop_id, id: params.id })
        .del()
        .transacting(trx);

    });

    result = 'OK';
    
    return {
      body: result
    }

  } catch (err) {
    console.log(`notice.remove error: `, err);
    throw { body: err };
  }
}

module.exports = {
  create,
  update,
  list,
  find,
  remove
};