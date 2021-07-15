const config = require('../../config');
const db = config.db;

async function info(token, body, query, params){
  try {

    let totalResult = await db('activity').where({ shop_id: token.shop_id }).sum({ 
      play: 'play',
      view: 'view',
      issued_amount: 'issued_amount',
      usage_amount: 'usage_amount'
    })

    totalResult = totalResult[0];

    let weekResult = await db('activity_log').where({ shop_id: token.shop_id, type: 3 })
      .whereBetween('created_time', [ new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), new Date()])
      .sum({ 
        play: 'play',
        view: 'view',
        issued_amount: 'issued_amount',
        usage_amount: 'usage_amount'
      })

    weekResult = weekResult[0];

    Object.keys(totalResult).forEach( key => totalResult[key] = parseInt(totalResult[key] || 0) )
    Object.keys(weekResult).forEach( key => weekResult[key] = parseInt(weekResult[key] || 0) )

    let totalShopUser = await db('user_subscribe').where({ shop_id: token.shop_id}).count();
    totalResult.user_amount = parseInt(totalShopUser[0].count);

    let weekShopUser = await db('user_subscribe').where({ shop_id: token.shop_id})
    .whereBetween('created_time', [ new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), new Date()]).count();
    weekResult.user_amount = parseInt(weekShopUser [0].count);

    return {
      body: {
        total: totalResult,
        week: weekResult
      }
    };

  } catch (err) {
    console.log(`statistics.info error: `, err);
    throw { body: err };
  }
}

module.exports = {
  info
};