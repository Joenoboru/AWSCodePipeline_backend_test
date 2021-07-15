const config = require('../../config');
const db = config.db;

async function list(token, body, query, params){
  try {

    if(token.platform !== 2){
      throw { code: 'PLATFORM_ERROR' }
    }

    let limit = query.limit || 10;
    let offset = query.offset || 0;
    let orderCriteria = {
      field: 'activity.id',
      condition: 'asc'
    };

    if(query.sort) {
      let tmp = query.sort.split(' ');
      orderCriteria.field = 'discount.' + tmp[0];
      orderCriteria.condition = tmp[1];
    }

    function cUnlimit(){
      this.where('unlimit', 1).orWhere(function(){
        this.where('unlimit', 0).andWhere('discount.quantity', '>', 0)
      })      
    }

    function cStartTime(){
      this.whereNull('activity.start_time').orWhere('activity.start_time', '<', new Date())
    }

    function cEndTime(){
      this.whereNull('activity.end_time').orWhere('activity.end_time', '>', new Date())
    }

    let amount = await db('discount').count('discount.id')
      .innerJoin('activity', 'discount.activity_id', 'activity.id')
      .where({'discount.type': 4, 'discount.status': 1, 'discount.shop_id': token.shop_id, 'activity.status': 1})
      .andWhere(cUnlimit).andWhere(cStartTime).andWhere(cEndTime);

    let discount = await db('discount').limit(limit).offset(offset)
      .select('discount.*', 'activity.public_id as activity_public_id', 'activity.name as activity_name', 'activity.type_id as activity_type_id')
      .innerJoin('activity', 'discount.activity_id', 'activity.id')
      .orderBy(orderCriteria.field, orderCriteria.condition)
      .where({'discount.type': 4, 'discount.status': 1, 'discount.shop_id': token.shop_id, 'activity.status': 1 })
      .andWhere(cUnlimit).andWhere(cStartTime).andWhere(cEndTime);
    
    return {
      body: {
        total: parseInt(amount[0].count),
        data: discount        
      }
    };

  } catch (err) {
    console.log(`discount.list error: `, err);
    throw { body: err };
  }
}

module.exports = {
  list
};