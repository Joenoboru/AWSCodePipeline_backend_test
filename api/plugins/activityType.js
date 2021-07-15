const config = require('../../config');
const db = config.db;

async function list(token, body, query, params){
  try {

    if(token.platform !== 2){
      throw { code: 'PLATFORM_ERROR' }
    }

    let activityType = await db('activity_type').where(query);

    let result = {
      total: activityType.length,
      data: activityType
    }
    
    return {
      body: result
    };

  } catch (err) {
    console.log(`activityType.list error: `, err);
    throw { body: err };
  }
}


module.exports = {
  list
};