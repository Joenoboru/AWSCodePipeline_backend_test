const config = require('../../config');
const uuidv1 = require('uuid/v1');
const db = config.db;
const Tools = require('../../tools');
const geohash = require('ngeohash');


function getPictureObj(urlArray=[], shop_id, activity_id, discount_id){

  urlArray.forEach(e => {
    shop_id ? e.shop_id = shop_id : null;
    activity_id ? e.activity_id = activity_id : null;
    discount_id ? e.discount_id = discount_id : null;
  })

  return urlArray;
}

async function create(token, body, query, params){
  try {

    if(token.platform !== 2){
      throw { code: 'PLATFORM_ERROR' }
    }

    let discounts=[], discountRate=0, activityPictures=body.picture, result={}, shopId=token.shop_id, tagConnections;

    body.shop_id = shopId;
    body.public_id = uuidv1();
    body.start_time = body.start_time ? new Date(body.start_time) : null;
    body.end_time = body.end_time ? getEndTime(body.end_time) : null;
    if(body.start_time > body.end_time) {
      throw { code: 'TIME_ERROR' }
    }

    body.use_start_time ? body.use_start_time = new Date(body.use_start_time) : null;
    body.use_end_time ? body.use_end_time = getEndTime(body.use_end_time) : null;
    if(body.use_start_time && body.use_end_time) {
      if(body.use_start_time > body.use_end_time) {
        throw { code: 'USE_TIME_ERROR' }
      }
    }

    let actType = await db('activity_type').where({ id: body.type_id });
    if( !(actType && actType.length && actType[0].class === body.class) ){
      throw { code: 'CLASS_TYPE_ERROR' }
    }

    /** Init Discount item */
    if(body.discounts && body.discounts.length) {
      body.discounts.forEach( d => { 
        d.type = ( body.class === 0 ? 1 : 4 );
        d.status = d.hasOwnProperty('status') ? d.status : 1;
        d.rate = ( body.class === 0 ? d.rate : 0 );
        if(d.use_serial_num) { 
          checkSerialNumSetting(d.serial_num_setting) 
          d.tmp_serial_num = d.serial_num_setting.start-1;
        }
      });
      discounts = discounts.concat(body.discounts);
    }

    /** Init Share Reward item */
    if(( body.share_discount || []).length) {
      body.share_discount.forEach( sd => { 
        sd.rate = 0;
        sd.type = 2;
        sd.status = sd.hasOwnProperty('status') ? sd.status : 1;
        if(sd.use_serial_num) { 
          checkSerialNumSetting(sd.serial_num_setting) 
          sd.tmp_serial_num = sd.serial_num_setting.start-1;
        }
      });
      discounts = discounts.concat(body.share_discount);
    }

    /** Init No Bingo Discount item */
    if(( body.no_bingo_discount || [] ).length && body.class === 0) {
      body.no_bingo_discount.forEach( nbd => { 
        nbd.type = 3;
        nbd.status = nbd.hasOwnProperty('status') ? nbd.status : 1 
        nbd.rate = ( body.class === 0 ? nbd.rate : 0 )
      });
      discounts = discounts.concat(body.no_bingo_discount);
    }

    tagConnections = body.tags;

    delete body.discounts;
    delete body.share_discount;
    delete body.no_bingo_discount;
    delete body.picture;
    delete body.tags;

    if( body.class === 0 ){
      /** Check if the sum of the rate is correct */
      discounts.forEach( d => { if(d.status){ discountRate = discountRate + d.rate } } )

      if(discountRate !== 100) {
        throw { code: 'DISCOUNT_RATE_ERROR' }
      }      
    }

    if(discounts.length > 10) {
      throw { code: 'DISCOUNT_OVER_LIMIT_ERROR' }
    }

    /** Create Activity and Discount */
    try {
      await db.transaction(async trx => {

        let activity = await db('activity').insert(body).transacting(trx).returning('*');

        if(!activity.length){
          throw true;
        }

        result = activity[0];

        let activityId = result.id, pictureObj = {};
        let pictures = getPictureObj(activityPictures, shopId, activityId);

        /** Produce Activity and Discount Picture Array*/
        for(let i=0; i < discounts.length; i++) {
          discounts[i].activity_id = activityId;
          discounts[i].public_id = uuidv1();
          discounts[i].shop_id = shopId;
          if(discounts[i].picture){
            discounts[i].picture.forEach( p => { p.discount_public_id = discounts[i].public_id; })
          }
          pictures = pictures.concat(getPictureObj(discounts[i].picture, shopId, activityId))
          delete discounts[i].picture;
        }

        let newDiscounts = await db('discount').insert(discounts).transacting(trx).returning('*');

        /** Create Picture */
        if(pictures.length){
          let newDiscountsObj = Tools.convertArrayToObject(newDiscounts, 'public_id');
          pictures.forEach( p => { 
            if(p.discount_public_id){ 
              p.discount_id = newDiscountsObj[p.discount_public_id].id;
              delete p.discount_public_id
            } 
          })
          let newPictures = await db('picture').insert(pictures).transacting(trx).returning('*');
          pictureObj = Tools.convertArrayToObjWithArray(newPictures, 'discount_id');
        }
        
        /** Create Tags */
        if(tagConnections && tagConnections.length) {
          let tags = await db('tag').where({ shop_id: shopId, type: 0 }).whereIn('id', tagConnections);
          tagConnections = Array.from( tags, t => {
            return {  
              tag_id: t.id,
              activity_id: activityId,
              type: 2 //shopOwner關聯
            }
          })
          await db('tag_connection').insert(tagConnections).transacting(trx);
        }        

        result.picture = pictureObj[null];
        /** Find Discounts and Put into Picture Data */
        result.discounts = await db('discount').where({ shop_id: result.shop_id , activity_id: result.id }).transacting(trx);
        result.discounts.forEach( e => {
          e.picture = pictureObj[e.id] || [];
        })
        /** Find Tags */
        result.tags = await db('tag').select('tag.*').innerJoin('tag_connection', 'tag.id', 'tag_connection.tag_id')
                      .where({ 'tag.shop_id': shopId , 'tag.type': 0, 'tag_connection.activity_id': result.id }).transacting(trx);

      });
    } catch(e) {
      console.log(e);
      throw { code: 'CREATE_ACTIVITY_FAILED' };
    }

    return {
      body: result
    }

  } catch (err) {
    console.log(`activity.create error: `, err);
    throw { body: err };
  }
}

async function list(token, body, query, params){
  try {
    
    if(token.platform !== 2 && token.platform !== 3 ){
      throw { code: 'PLATFORM_ERROR' }
    }

    let filter = JSON.parse(JSON.stringify(query)), result={}, amount, data, search, shopPublic_id, locCriteria=[];
    let latitude=25.034263, longitude=121.564553; // 若沒有目前地址，以101當預設地址

    let orderCriteria = {
      field: 'activity.id',
      condition: 'asc'
    };

    let limit = query.limit || 10;
    let offset = query.offset || 0;

    if(query.sort) {
      let tmp = query.sort.split(' ');
      orderCriteria.field = 'activity.' + tmp[0];
      orderCriteria.condition = tmp[1];
      if(orderCriteria.field === 'activity.distance'){ orderCriteria.field =  'shop_distance' }
    }

    if(query.search){
      search = '%' + query.search + '%';
    }

    switch(token.type){
      case 2:
        filter.shop_id = token.shop_id;
        break;
      case 3:
      case 4:
        filter.status = 1;
        break;
    }

    if(query.shop_public_id) {
      shopPublic_id = query.shop_public_id;
    }

    if( filter.hasOwnProperty('latitude') && filter.hasOwnProperty('longitude') ){
      // 用 geohash 找出附近商家
      latitude = filter.latitude;
      longitude = filter.longitude;

      var precision = ( parseInt(filter.precision) ) ? filter.precision : 6;
      let nowGeohash = geohash.encode( latitude, longitude, precision )
      locCriteria.push( nowGeohash );
      locCriteria = locCriteria.concat( geohash.neighbors(nowGeohash) );
    }

    delete filter.limit;
    delete filter.offset;
    delete filter.sort;
    delete filter.search;
    delete filter.shop_public_id;
    delete filter.precision;
    delete filter.latitude;
    delete filter.longitude;

    Object.keys(filter).map(e => {
      switch(e) {
        case 'tag_id':
          filter['tag_connection.' + e] = filter[e]; delete filter[e];
          break;
        default:
          filter['activity.' + e] = filter[e]; delete filter[e];
      }
    });

    function cSearch(){
      this.where('activity.name', 'like', search).orWhere('shop.name', 'like', search);
    }

    function cPeriod(){
      this.andWhere('activity.start_time', '<', new Date())
       .andWhere('activity.end_time', '>', new Date());;
    }

    function cLocation(){
      this.andWhere(function() {
        for(let i=0; i<locCriteria.length; i++){
          this.orWhere('shop.geohash', 'like', locCriteria[i]+'%')
        }
      })  
    }

    let totalQueryRaw = db('activity')
      .count('activity.id')
      .innerJoin('shop', 'activity.shop_id', 'shop.id')
      .where(filter);

    let dataQueryRaw = db('activity').limit(limit).offset(offset)
      .select('activity.*', 'shop.name as shop_name', 'shop.logo as shop_logo', 'shop.latitude as shop_latitude', 'shop.longitude as shop_longitude', 'picture.url as picture_url')
      .innerJoin('shop', 'activity.shop_id', 'shop.id')
      .where(filter)
      .orderBy(orderCriteria.field,orderCriteria.condition)
      .leftJoin('picture', function(){
        this.on('picture.activity_id', 'activity.id')
        this.andOn('picture.type', 1)
        this.andOn('picture.id', db.raw('(select min(id) from picture where picture.activity_id = activity.id and picture.discount_id is null)'))
      })

    if(query.class == '0' && (token.type === 3 || token.type === 4)) {
      totalQueryRaw.andWhere(cPeriod)
      dataQueryRaw.andWhere(cPeriod);
    }

    if(query.tag_id) {
      totalQueryRaw.innerJoin('tag_connection', 'activity.id', 'tag_connection.activity_id');
      dataQueryRaw.innerJoin('tag_connection', 'activity.id', 'tag_connection.activity_id');
    }

    if(shopPublic_id) {
      totalQueryRaw.andWhere('shop.public_id', shopPublic_id);
      dataQueryRaw.andWhere('shop.public_id', shopPublic_id);
    }

    if(search){
      totalQueryRaw.andWhere(cSearch);
      dataQueryRaw.andWhere(cSearch);
    }

    if(orderCriteria.field === 'shop_distance'){
      // calculate_distance 為自定義 function，可見 summa-documentation 的 migrationSQL.sql
      dataQueryRaw.select( db.raw(`calculate_distance(${latitude}, ${longitude}, shop.latitude, shop.longitude, 'K') as shop_distance`))
    }

    if(locCriteria.length){
      totalQueryRaw.andWhere(cLocation);
      dataQueryRaw.andWhere(cLocation);
    }

    amount = await totalQueryRaw;
    data = await dataQueryRaw;

    result.total = parseInt(amount[0].count);
    result.data = data;

    return {
      body: result 
    };

  } catch (err) {
    console.log(`activity.list error: `, err);
    throw { body: err };
  }
}

async function find(token, body, query, params){
  try {
    if(!params.public_id) {
      throw { code: 'PUBLICID_UNDEFINED' }
    }

    let filter = {};

    if(token.type === 2){
      filter.shop_id = token.shop_id;
    }

    if(token.type === 3 || token.type === 4){
      filter.status = 1;
    }
    
    let dataQueryRaw = db('activity').where(Object.assign(filter, { public_id: params.public_id }));

    if(!query.class && (token.type === 3 || token.type === 4)) {
      dataQueryRaw = dataQueryRaw
        .andWhere('activity.start_time', '<', new Date())
        .andWhere('activity.end_time', '>', new Date());
    }

    let activity = await dataQueryRaw;
    if(activity.length > 1){
      throw { code: 'ACTIVITY_DUPLICATE' }
    }

    if(activity.length < 1){
      throw { code: 'ACTIVITY_NOT_EXISTS' }
    }

    //若是 user & vistor 增加view 次數
    if(token.type === 3 || token.type === 4) { 
      let activity_id = activity[0].id, shop_id = activity[0].shop_id;
      try {
        await db.transaction(async trx => { 
          await knexUpsert(trx, 'activity_log', ['activity_id', 'type', 'year', 'month', 'day'], Tools.getActLog(activity_id, shop_id));
          activity = await db('activity').where({ id: activity_id }).increment({ view: 1}).returning('*').transacting(trx);
          await db('activity_log').where(Tools.getActLog(activity_id, shop_id)).increment({ view: 1}).transacting(trx);
        })
      }  catch(e) {
        throw { code: 'ACTIVITY_UPDATE_FAILED'} 
      }
    }

    activity = activity[0];

    let pictures = await db('picture').where({ activity_id: activity.id });
    let pictureObj = Tools.convertArrayToObjWithArray(pictures, 'discount_id');

    activity.picture = pictureObj[null];
    if(token.type === 2){
      activity.discounts = await db('discount').where({ shop_id: activity.shop_id , activity_id: activity.id });
      activity.discounts.forEach( e => {
        e.picture = pictureObj[e.id] || [];
      })
    } else {
      let findShareDiscount = await db('discount')
        .where({ shop_id: activity.shop_id , activity_id: activity.id, type: 2, unlimit:1, status:1 })
        .orWhere(function(){ this.where({
          shop_id: activity.shop_id , 
          activity_id: activity.id,
          type: 2, status: 1, unlimit: 0 }).andWhere('quantity', '>', 0) 
        });
      //isOwnShareDiscount = true 前端分享活動時會呼叫API反之則否, 當user已拿到分享獎勵或為visitor時將不呼叫API
      let findUserShareDiscount = [''];
      if(token.type === 3) {
        findUserShareDiscount = await db('user_log')
        .where({user_id: token.id, activity_id: activity.id, action: 2, type: 2});
      }
      findShareDiscount.length > 0 && !findUserShareDiscount.length ? activity.isOwnShareDiscount = true : activity.isOwnShareDiscount = false;
    }

    let shopInfo = await db('shop').select(['name', 'category', 'address', 'web', 'description', 'tel', 'logo', 'public_id']).where({ id: activity.shop_id });
    activity.shop_info = shopInfo[0];

    /** Find Tags */
    activity.tags = await db('tag').select('tag.*').innerJoin('tag_connection', 'tag.id', 'tag_connection.tag_id')
    .where({ 'tag.shop_id': activity.shop_id , 'tag.type': 0 , 'tag_connection.activity_id': activity.id});

    if(token.type === 3 && token.id) {
      let userPlayTimes = await db('user_log').count().where({ user_id: token.id, type: 1, activity_id: activity.id });
      activity.user_played = parseInt(userPlayTimes[0].count);
    }

    return {
      body: activity
    };
  } catch (err) {
    console.log(`activity.find error: `, err);
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

    let shopId = token.shop_id;
    let activity = await db('activity').where({ shop_id: shopId, public_id: params.public_id });
    if(activity.length > 1){
      throw { code: 'ACTIVITY_DUPLICATE' }
    }

    if(activity.length < 1){
      throw { code: 'ACTIVITY_NOT_EXISTS' }
    }

    body.start_time ? body.start_time = new Date(body.start_time) : null;
    body.end_time ? body.end_time = getEndTime(body.end_time) : null;
    if(body.start_time > body.end_time) {
      throw { code: 'TIME_ERROR' }
    }

    body.use_start_time ? body.use_start_time = new Date(body.use_start_time) : null;
    body.use_end_time ? body.use_end_time = getEndTime(body.use_end_time) : null;
    if(body.use_start_time && body.use_end_time) {
      if(body.use_start_time > body.use_end_time) {
        throw { code: 'USE_TIME_ERROR' }
      }
    }

    activity = activity[0];
    let activityId = activity.id
    let discountType = (activity.class === 0) ? 1 : 4;

    let discounts = await db('discount').where({ shop_id: shopId, activity_id: activityId });
    
    let discountsObj = Tools.convertArrayToObject(discounts, 'id');
    let picture, newActivityPicture=[], newDiscountPicture=[], updatePicture, removePicture,
        newDiscount=[], updateDiscount=[], removeDiscount=[], tagConnections;
    let discountRate=0, discountCount=0, result;

    //sort out activity picture & tags
    picture = body.picture || [];
    tagConnections = body.tags;
    delete body.picture;
    delete body.tags;

    function judgePicture(array) {
      let create = [], remove = [], update = [];
      array.forEach( e => {
        // create picture
        if(!e.isDelete && !e.id){
          delete e.isDelete;
          create.push(e);
          return;
        }
        // delete picture
        if(e.isDelete && e.id){
          remove.push(e);
          return; 
        }
        // update picture
        if(!e.isDelete && e.id){
          delete e.isDelete;
          update.push(e);
          return;
        }
      });
      return { create, remove, update }
    }

    picture = judgePicture(picture);

    newActivityPicture = getPictureObj(picture['create'], shopId, activityId);
    updatePicture = picture['update'];
    removePicture = picture['remove'];

    if( body.discounts && body.discounts.length ){

      /** Remove/Create/Update Discount */

      body.discounts.forEach( d => {
        
        // remove discount
        if(d.status === 3 && discountsObj[d.id] && discountsObj[d.id].type === discountType){
          removeDiscount.push(d); 
          return; 
        }

        // create discount
        if(!d.id){
          d.type = discountType;
          d.rate = ( activity.class === 0 ? d.rate : 0 );
          d.status = d.hasOwnProperty('status') ? d.status : 1;
          if(d.use_serial_num) { 
            checkSerialNumSetting(d.serial_num_setting) 
            d.tmp_serial_num = d.serial_num_setting.start-1;
          }
          newDiscount.push(d);
          return;
        }

        // update discount
        if(d.id && discountsObj[d.id] && discountsObj[d.id].type === discountType){
          if(activity.class !== 0) { delete d.rate }
          updateDiscount.push(d);
          return;
        }
      });

    }

    if( (body.share_discount || []).length ){ checkDiscounts(2, body.share_discount[0]); }

    if( (body.no_bingo_discount || []).length ) { checkDiscounts(3, body.no_bingo_discount[0]); }
      
    function checkDiscounts(type, nDiscount){
      let oDiscount = discounts.filter( d => d.type === type );
      let status = nDiscount.hasOwnProperty('status') ? nDiscount.status : 1;
      if( oDiscount.length ){
        updateDiscount.push( Object.assign(nDiscount, { id: oDiscount[0].id }));
      } else {
        newDiscount.push(Object.assign(nDiscount, { type, status }));
      }
    }

    updateDiscount.forEach( ud => {
      if(discountsObj[ud.id].use_serial_num && ud.serial_num_setting){
        let uSerialNumSetting = discountsObj[ud.id].serial_num_setting;
        uSerialNumSetting.end = ud.serial_num_setting.end || uSerialNumSetting.end
        ud.serial_num_setting = uSerialNumSetting;
      } else {
        delete ud.serial_num_setting;
      }
      ud = Object.assign( discountsObj[ud.id], ud )
    });
    removeDiscount.forEach( rd => delete discountsObj[rd.id] )
    discounts = Object.keys(discountsObj).map( id => discountsObj[id] );
    discounts = discounts.concat(newDiscount);

    delete body.discounts;
    delete body.share_discount;
    delete body.no_bingo_discount;
    
    /** Check if the sum of the rate is correct */
    if(activity.class === 0){
      discounts.forEach( d => { 
        if(d.status === 1){ discountRate = discountRate + d.rate } 
        if(d.type === 1){ discountCount++; }
      })
      if(discountRate != 100) {
        throw { code: 'DISCOUNT_RATE_ERROR' }
      }      
    }

    if(discountCount > 10) {
      throw { code: 'DISCOUNT_OVER_LIMIT_ERROR' }
    }


    await db.transaction(async trx => {

      let discounts=[];

      result = await db('activity').where({ id: activity.id }).update(body).transacting(trx).returning('*');

      if(!result.length){
        throw { code: 'UPDATE_ACTIVITY_FAILED' }
      }

      result = result[0];

      for(let i=0; i<updateDiscount.length; i++){
        let id = updateDiscount[i].id;
        if( (updateDiscount[i].picture || []).length) {
          let updateDiscountPicture = judgePicture(updateDiscount[i].picture);
          updatePicture = updatePicture.concat(updateDiscountPicture['update']);
          removePicture = removePicture.concat(updateDiscountPicture['remove']);
          newDiscountPicture = newDiscountPicture.concat(getPictureObj(updateDiscountPicture['create'], shopId, activity.id, id));
        }
        delete updateDiscount[i].id;
        delete updateDiscount[i].picture;
        delete updateDiscount[i].use_serial_num;
        await db('discount').where({ id }).update(updateDiscount[i]).transacting(trx);
      }

      if(removeDiscount.length){
        let discountIds = removeDiscount.map( r => r.id );
        await db('discount').whereIn('id', discountIds).transacting(trx).del();
        await db('picture').whereIn('discount_id', discountIds).transacting(trx).del();
      }

      if(newDiscount.length){
        for(let i = 0; i < newDiscount.length; i++) {
          newDiscount[i].public_id = uuidv1();
          newDiscount[i].activity_id = activity.id; 
          newDiscount[i].shop_id = shopId;
          if(newDiscount[i].picture){
            newDiscount[i].picture.forEach( p => { p.discount_public_id = newDiscount[i].public_id; })
          }
          newDiscountPicture = newDiscountPicture.concat(getPictureObj(newDiscount[i].picture, shopId, activity.id))
          delete newDiscount[i].picture;
        }

        discounts = await db('discount').insert(newDiscount).transacting(trx).returning('*');
      }

      if(newDiscountPicture.length) {
        let discountsObj = Tools.convertArrayToObject(discounts, 'public_id');
        newDiscountPicture.forEach( p => { 
          if(p.discount_public_id){ 
            p.discount_id = discountsObj[p.discount_public_id].id;
            delete p.discount_public_id;
          } 
          delete p.isDelete;
        })
      }

      picture = newActivityPicture.concat(newDiscountPicture);

      if(picture.length){
        await db('picture').insert(picture).transacting(trx);
      }

      if(updatePicture.length) {
        for(let i = 0; i < updatePicture.length; i++) {
          await db('picture').where({ id: updatePicture[i].id }).update({url: updatePicture[i].url}).transacting(trx);
        }
      }

      if(removePicture.length) {
        await db('picture').whereIn('id', removePicture.map( r => r.id )).transacting(trx).del();
      }

      if(tagConnections) {
        //移除該活動shopOwner關聯的tag_connections
        await db('tag_connection').where({'activity_id': activityId, type: 2}).transacting(trx).del();
        //新增更新的tag_connections
        if(tagConnections.length){
          let tags = await db('tag').where({ shop_id: shopId, type: 0 }).whereIn('id', tagConnections);
          tagConnections = Array.from(tags, t=> {
            return {  
              tag_id: t.id,
              activity_id: activityId,
              type: 2 
            }
          });
          await db('tag_connection').insert(tagConnections).transacting(trx);          
        }
      }

      let pictures = await db('picture').where({ activity_id: activityId }).transacting(trx);
      let pictureObj = Tools.convertArrayToObjWithArray(pictures, 'discount_id');
  
      result.picture = pictureObj[null];
      result.discounts = await db('discount').where({ shop_id: activity.shop_id, activity_id: activity.id }).transacting(trx);
      result.discounts.forEach( e => {
        e.picture = pictureObj[e.id] || [];
      })
      /** Find Tags */
      result.tags = await db('tag').select('tag.*').innerJoin('tag_connection', 'tag.id', 'tag_connection.tag_id')
      .where({ 'tag.shop_id': shopId , 'tag.type': 0, 'tag_connection.activity_id': activityId }).transacting(trx);
    });

    return {
      body: result
    };

  } catch (err) {
    console.log(`activity.update error: `, err);
    throw { body: err };
  }
}

async function result(token, body, query, params){
  try {

    /** Check Identity && Get Activity Information */

    if(token.platform !== 3){
      throw { code: 'PLATFORM_ERROR' }
    }

    // 1. 取得活動相關資訊 
    let activity = await db('activity').where({ public_id: query.activity_public_id });

    if(activity.length > 1){
      throw { code: 'ACTIVITY_DUPLICATE' }
    }

    if(activity.length < 1){
      throw { code: 'ACTIVITY_NOT_EXISTS' }
    }

    activity = activity[0];

    if( activity.class !== 0 ) {
      throw { code: 'ACTIVITY_CLASS_ERROR' }
    }

    if( activity.type_id !== 2 ) {
      throw { code: 'ACTIVITY_TYPE_ERROR' }
    }

    if( !activity.status || new Date() > activity.end_time) {
      throw { code: 'ACTIVITY_FINISHED' }
    }

    // 2. 取得使用者基本資料 -> @user (table: user)
    let user = await db('user').where({ id: token.id, type: 3 });
    if(user.length > 1){
      throw { code: 'USER_DUPLICATE' }
    }

    if(user.length < 1){
      throw { code: 'USER_NOT_EXISTS' }
    }

    user = user[0];
    if(!user.status) {
      throw { code: 'USER_SUSPENDED' }
    }

    // 3. 檢查遊玩次數（TMP）
    if( activity.limit>=0 ){
      let userPlayTimes = await db('user_log').count().where({ user_id: user.id, type: 1, activity_id: activity.id });
    
      if(userPlayTimes[0] && parseInt(userPlayTimes[0].count, 10) >= activity.limit) {
        throw { code: 'OVER_PLAY_LIMIT' }
      }
    }

    // Variable Init
    let activity_id = activity.id, shop_id = activity.shop_id, user_id = user.id, today = new Date(), loopLimit=5, result={};    

    while(loopLimit--){
      let discounts = await db('discount').where({ activity_id, shop_id, status: 1 }).whereIn('type', [1, 3]);

      // 5. 計算使用者是否取得折扣
      discounts.forEach( d => {
        if(!d.unlimit){
          if(d.quantity <= 0) { d.rate = 0; } //已經抽完的折扣將機率歸0
          if(d.use_serial_num && d.serial_num_setting && d.tmp_serial_num >= d.serial_num_setting.end){ d.rate = 0; }
        }
      });

      discounts = discounts.filter(e => e.rate > 0);

      let totalRate=0, bingoDiscount={}, lotteryBoxArray=[], userDiscount;

      for(let i = 0; i < discounts.length; i++) {
        let discontArray = Array(discounts[i].rate).fill(discounts[i].id);
        lotteryBoxArray  = lotteryBoxArray.concat(discontArray);
        totalRate += discounts[i].rate;
      }

      if(!lotteryBoxArray.length) {
        await db('activity').where({ id: activity.id }).update({status: 0});
        throw { code: 'ACTIVITY_FINISHED' }
      }

      //抽！
      let random = Math.floor(Math.random() * totalRate);
      bingoDiscount = discounts.filter( d => d.id === lotteryBoxArray[random] );

      if(!bingoDiscount.length){
        continue;
      }

      bingoDiscount = bingoDiscount[0];

      try {

        await db.transaction(async trx => {

          await knexUpsert(trx, 'user_subscribe', ['shop_id', 'user_id'], { shop_id, user_id })
          await knexUpsert(trx, 'activity_log', ['activity_id', 'type', 'year', 'month', 'day'], Tools.getActLog(activity_id, shop_id));

          if(bingoDiscount.type === 1){

            let tmp_serial_num;

            if(bingoDiscount.use_serial_num ){
              checkSerialNumSetting(bingoDiscount.serial_num_setting);
              let setTmpSerialNum = await db('discount').where({ id: bingoDiscount.id }).increment({ tmp_serial_num: 1 }).update({ updated_time: new Date() }, ['tmp_serial_num']).transacting(trx);
              if(setTmpSerialNum[0].tmp_serial_num > bingoDiscount.serial_num_setting.end){
                throw { code: 'INSUFFICIENT_SERIAL_NUMBER' }
              }
              tmp_serial_num = setTmpSerialNum[0].tmp_serial_num;
            }

            userDiscount = await db('user_discount').insert( 
              getUserDiscount( activity, bingoDiscount, { user_id, shop_id, activity_id, tmp_serial_num })
            ).returning('*').transacting(trx);

            userDiscount = userDiscount[0];

            let code = await Tools.generateCode(config.codeSecret, userDiscount.id, 'D');
            await db('user_discount').where({ id: userDiscount.id }).update({ code: code }).transacting(trx);
            await db('user_log').insert(getUserLog({ user_id, activity_id, type: 1, bingo: 2})).transacting(trx);
            await db('user_log').insert(getUserLog({ user_id, activity_id, type: 2, action: 1, user_discount_id: userDiscount.id })).transacting(trx);
            await db('activity').where({ id: activity.id }).increment({ play: 1, issued_amount: 1 }).transacting(trx);
            await db('activity_log').where(Tools.getActLog(activity_id, shop_id)).increment({ play: 1, issued_amount: 1 }).transacting(trx);
            
            if(bingoDiscount.unlimit) {
              await db('discount').where({id: bingoDiscount.id}).increment({ issued_amount: 1 }).transacting(trx);
            }else{
              let updateDiscountRes = await db('discount').where({ id: bingoDiscount.id }).increment({ issued_amount: 1 }).decrement({ quantity: 1 }).update({ updated_time: new Date() }, ['quantity']).transacting(trx);
              if( updateDiscountRes[0].quantity < 0){
                throw { code: 'INSUFFICIENT_QUANTITY' }
              }
            }

          } else {
            await db('user_log').insert(getUserLog({ user_id: user_id, activity_id: activity_id, type: 1, bingo: 1})).transacting(trx);
            await db('activity').where({ id: activity.id }).increment({ play: 1 }).transacting(trx);
            await db('activity_log').where(Tools.getActLog(activity_id, shop_id)).increment({ play: 1 }).transacting(trx);
          }

          let discounts = await db('discount').where(function(){ this.where({ activity_id, shop_id, type: 3, status: 1 }).andWhere('rate', '>', 0) })
          .orWhere(function(){ this.where({ activity_id, shop_id, type: 1, status: 1, unlimit: 0 }).andWhere('quantity', '>', 0) })
          .orWhere(function(){ this.where({ activity_id, shop_id, type: 1, status: 1, unlimit: 1 })}).transacting(trx);

          if(!discounts.length) {
            await db('activity').where({ id: activity.id }).update({status: 0}).transacting(trx);
          }

        });

      } catch(e) {
        console.log(e);
        if(e && (e.code === 'INSUFFICIENT_QUANTITY') || (e.code === 'INSUFFICIENT_SERIAL_NUMBER')){
          continue;
        } else if(e && e.code && !e.line) {
          throw e
        } else {
          throw { code: 'GET_ACTIVITY_RESULT_FAILED'}            
        }
      }

      let pictures = await db('picture').where({ activity_id: bingoDiscount.activity_id, discount_id: bingoDiscount.id });
      result.bingo = bingoDiscount.type === 1 ? 2 : 1;
      result.name = bingoDiscount.name;
      result.description = bingoDiscount.description;
      result.picture_url = pictures && pictures.length ? pictures[0].url : null;
      result.serial_num = bingoDiscount.type === 1 ? userDiscount.serial_num : null;
      bingoDiscount.type === 1 ? result.user_discount_id = userDiscount.id : null;

      break;
    }

    return {
      body: result
    };

    throw { code: 'GET_ACTIVITY_RESULT_FAILED' }

  } catch (err) {
    console.log(`activity.result error: `, err);
    throw { body: err };
  }
}

async function getDiscount(token, body, query, params){
  try {

    query.type = parseInt(query.type, 10);
    /** Check Identity && Get Activity Information */

    if( token.platform !== 3 ){
      throw { code: 'PLATFORM_ERROR' }
    }

    // 1. 取得活動相關資訊 

    let activityQuery = { public_id: query.activity_public_id };
    
    if( query.type === 1 ){
      activityQuery.type_id = 1;
    }

    let activity = await db('activity').where(activityQuery);

    if( activity.length > 1 ){
      throw { code: 'ACTIVITY_DUPLICATE' }
    }

    if( activity.length < 1 ){
      throw { code: 'ACTIVITY_NOT_EXISTS' }
    }

    activity = activity[0];

    if( !activity.status || new Date() > activity.end_time ) {
      throw { code: 'ACTIVITY_FINISHED' }
    }

    // 2. 取得使用者基本資料 -> @user (table: user)
    let user = await db('user').where({ id: token.id, type: 3 });
    if( user.length > 1 ){
      throw { code: 'USER_DUPLICATE' }
    }

    if( user.length < 1 ){
      throw { code: 'USER_NOT_EXISTS' }
    }

    user = user[0];
    if( !user.status ) {
      throw { code: 'USER_SUSPENDED' }
    }

    // 3. 檢查遊玩次數
    let userLogQuery = { user_id: user.id, activity_id: activity.id };

    if( query.type === 1 ) { // 登入送
      userLogQuery.action = 1;
    }

    if( query.type === 2 ) { // 分享
      activity.limit = 1;    // 分享限制只能一次
      userLogQuery.action = 2;
    }

    if( activity.limit>=0 ){
      let userPlayTimes = await db('user_log').count().where(userLogQuery);
    
      if( userPlayTimes[0] && parseInt(userPlayTimes[0].count, 10) >= activity.limit ) {
        throw { code: `OVER_${ query.type === 2 ? 'SHARE' : 'PLAY'}_LIMIT` }
      }
    }
    

    // Variable Init
    let activity_id = activity.id, shop_id = activity.shop_id, user_id = user.id, today = new Date();    

    let discounts = await db('discount').where({ activity_id, shop_id, type: query.type, status: 1 });

    if( discounts.length !== 1 ){
      throw { code: 'GET_DISCOUNT_INFO_FAILED'}
    }

    let bingoDiscount = discounts[0];

    if( bingoDiscount.unlimit===0 && bingoDiscount.quantity<=0 ){
      if( query.type === 1 ){
        await db('activity').where({ id: activity.id }).update({status: 0});
        throw { code: 'ACTIVITY_FINISHED' }
      }else{
        throw { code: 'INSUFFICIENT_QUANTITY' }
      }
    }

    let userDiscount, result = {};

    try{

      await db.transaction(async trx => {

        await knexUpsert(trx, 'user_subscribe', ['shop_id', 'user_id'], { shop_id, user_id });
        await knexUpsert(trx, 'activity_log', ['activity_id', 'type', 'year', 'month', 'day'], Tools.getActLog(activity_id, shop_id));
        
        let tmp_serial_num;

        if(bingoDiscount.use_serial_num){
          checkSerialNumSetting(bingoDiscount.serial_num_setting);
          let setTmpSerialNum = await db('discount').where({ id: bingoDiscount.id }).increment({ tmp_serial_num: 1 }).update({ updated_time: new Date() }, ['tmp_serial_num']).transacting(trx);
          if(setTmpSerialNum[0].tmp_serial_num > bingoDiscount.serial_num_setting.end){
            throw { code: 'INSUFFICIENT_SERIAL_NUMBER' }
          }
          tmp_serial_num = setTmpSerialNum[0].tmp_serial_num;
        }

        userDiscount = await db('user_discount').insert(
          getUserDiscount( activity, bingoDiscount, { user_id, shop_id, activity_id, tmp_serial_num })
        ).returning('*').transacting(trx);
        
        userDiscount = userDiscount[0];
        
        let code = await Tools.generateCode(config.codeSecret, userDiscount.id, 'D');
        await db('user_discount').where({ id: userDiscount.id }).update({ code: code }).transacting(trx);

        if( bingoDiscount.unlimit ) {
          await db('discount').where({id: bingoDiscount.id}).increment({ issued_amount: 1 }).transacting(trx);
        }else{
          let updateDiscountRes = await db('discount').where({ id: bingoDiscount.id }).increment({ issued_amount: 1 }).decrement({ quantity: 1 }).update({ updated_time: new Date() }, ['quantity']).transacting(trx);
          if( updateDiscountRes[0].quantity < 0 ){
            throw { code: 'INSUFFICIENT_QUANTITY' }
          }
        }

        if( bingoDiscount.type === 1 ){ // 登入送
          await db('user_log').insert(getUserLog({ user_id: user_id, activity_id: activity_id, type: 2, action: 1, user_discount_id: userDiscount.id})).transacting(trx);
          await db('activity').where({ id: activity.id }).increment({ play: 1, issued_amount: 1 }).transacting(trx);
          await db('activity_log').where(Tools.getActLog(activity_id, shop_id)).increment({ play: 1, issued_amount: 1 }).transacting(trx);
          

          let discounts = await db('discount').where({activity_id, shop_id, type: 1, status: 1, unlimit: 1})
            .orWhere(function(){ this.where({ activity_id, shop_id, type: 1, status: 1, unlimit: 0 }).andWhere('quantity', '>', 0) }).transacting(trx);

          if( !discounts.length ) {
            await db('activity').where({ id: activity.id }).update({status: 0}).transacting(trx);
          }
        }

        if( bingoDiscount.type === 2 ){ // 分享送
          await db('user_log').insert(getUserLog({ user_id: user_id, activity_id: activity_id, type: 2, action: 2, user_discount_id: userDiscount.id})).transacting(trx);
          await db('activity').where({ id: activity.id }).increment({ share: 1 }).transacting(trx);
          await db('activity_log').where(Tools.getActLog(activity_id, shop_id)).increment({ share: 1 }).transacting(trx);
        }
        
      });
    } catch(e){
      console.log(e);
      if(e && e.code && !e.line){
        throw e
      } else {
        throw { code: 'GET_ACTIVITY_DISCOUNT_FAILED' }           
      }
    }

    result.bingo = 2;
    result.name = bingoDiscount.name;
    result.description = bingoDiscount.description;
    result.user_discount_id = userDiscount.id;
    result.serial_num = userDiscount.serial_num;

    return {
      body: result
    };

  } catch (err) {
    console.log(`activity.getDiscount error: `, err);
    throw { body: err };
  }
}

async function sendVoucher(token, body, query, params){
  try {

    if(token.platform !== 2){
      throw { code: 'PLATFORM_ERROR' }
    }

    // 1. 取得活動相關資訊 
    let activity = await db('activity').where({ public_id: body.activity_public_id, shop_id: token.shop_id });

    if(activity.length > 1){
      throw { code: 'ACTIVITY_DUPLICATE' }
    }

    if(activity.length < 1){
      throw { code: 'ACTIVITY_NOT_EXISTS' }
    }

    activity = activity[0];

    if( activity.class !== 1 ) {
      throw { code: 'ACTIVITY_CLASS_ERROR' }
    }

    if(!activity.status) {
      throw { code: 'ACTIVITY_FINISHED' }
    }

    if(activity.end_time) {
      if(new Date() > activity.end_time) {
        throw { code: 'ACTIVITY_FINISHED' }
      }
    }

    //解析body.user_token
    let userIdFromToken, tokenExpirceTime;

    try {
      let decodeUserToken = await Tools.decodeUserToken(config.userTokenSecret, body.user_token);
      if(!decodeUserToken){ throw true; }
      decodeUserToken = decodeUserToken.split(',');
      userIdFromToken = Number(decodeUserToken[0]);
      tokenExpirceTime = Number(decodeUserToken[1]);
    } catch(e) {
      console.log(e);
      throw { code: 'TOKEN_INCORRECT' }
    }

    //檢查token時效
    if(tokenExpirceTime < new Date().getTime()) {
      throw { code: 'TOKEN_EXPIRED' }
    }

    //2. 確認token中的user_id 與 user_code是匹配的, 取得使用者相關資料
    let user = await db('user').where({ id: userIdFromToken, code: body.user_code, type: 3 });

    if(user.length > 1){
      throw { code: 'USER_DUPLICATE' }
    }

    if(user.length < 1){
      throw { code: 'USER_NOT_EXISTS' }
    }

    user = user[0];

    if(!user.status) {
      throw { code: 'USER_SUSPENDED' }
    }

    let user_id = user.id, activity_id = activity.id, shop_id = activity.shop_id;

    // 2. 使用者於此活動的參與紀錄
    if( activity.limit>=0 ){ 
      let userPlayTimes = await db('user_log').count().where({ user_id: user_id, activity_id: activity_id, type: 3, action: 3  });
      if(userPlayTimes[0] && parseInt(userPlayTimes[0].count, 10) >= activity.limit) {
        throw { code: 'ACTIVITY_LIMIT_REACHED' }
      }
    }

    //4. 判斷使用者是否能取得商品劵
    let discounts = await db('discount').where({ public_id: body.discount_public_id, type: 4, status: 1 });
    discounts = discounts[0];

    if(discounts.quantity < 1) {
      throw { code: 'ACTIVITY_FINISHED' }
    }

    //判斷是否有帶分店public_id
    let shopBranch;
    if(body.shop_branch_public_id) {
      shopBranch = await db('shop_branch').where({ public_id: body.shop_branch_public_id, status: 1 });
      if(shopBranch.length > 1){
        throw { code: 'SHOP_BRANCH_DUPLICATE' }
      }
      if(shopBranch.length < 1){
        throw { code: 'SHOP_BRANCH_NOT_EXISTS' }
      }
      shopBranch = shopBranch[0];
    }
    
  try {
    await db.transaction(async trx => {
      //1. 今日的活動紀錄
      await knexUpsert(trx, 'activity_log', ['activity_id', 'type', 'year', 'month', 'day'], Tools.getActLog(activity_id, shop_id));
      
      //3. 檢查使用者是否已有加入店家
      await knexUpsert(trx, 'user_subscribe', ['shop_id', 'user_id'], { shop_id, user_id });

      let discountArray = [];
      //5. 依 @discount.number 設定，儲存相同數量的使用者商品劵
      for(let i=0; i < discounts.number; i++) {
        discountArray[i] = getUserDiscount( activity, discounts, { user_id, shop_id, activity_id, sender: token.id })
      }
      let createdDiscounts = await db('user_discount').insert(discountArray).returning('*').transacting(trx);

      let updateDiscount = {};
      if(shopBranch) {
        updateDiscount.send_shop_branch_id = shopBranch.id;
      }
      for(let i=0; i < createdDiscounts.length; i++) {
        updateDiscount.code = await Tools.generateCode(config.codeSecret, createdDiscounts[i].id, 'D');;
        await db('user_discount').where({ id: createdDiscounts[i].id }).update(updateDiscount).transacting(trx);
      }

      //5. 存使用者得到折扣的log
      await db('user_log').insert(getUserLog({ user_id: user_id, activity_id: activity_id, type: 3, action: 3 })).transacting(trx);

      //5. @activity.issued_amount +1
      await db('activity').where({ id: activity.id }).increment({ issued_amount: 1 }).transacting(trx);

      //5. @discount.issued_amount +1
      if(discounts.unlimit) {
        await db('discount').where({id: discounts.id}).increment({ issued_amount: 1 }).transacting(trx);
      }else{
        let updateDiscountRes = await db('discount').where({ id: discounts.id }).increment({ issued_amount: 1 }).decrement({ quantity: 1 }).update({ updated_time: new Date() }, ['quantity']).transacting(trx);
        if( updateDiscountRes[0].quantity < 0){
          throw { code: 'INSUFFICIENT_QUANTITY' }
        }
      }

      //5. 每日的 @activity_log.issued_amount +1
      await db('activity_log').where(Tools.getActLog(activity_id, shop_id)).increment({issued_amount: 1 }).transacting(trx);

      //5. 計算此活動的折扣是否發完，發完就要關閉活動
      discounts = await db('discount').where(function(){ this.where({ activity_id, shop_id, type: 4, status: 1, unlimit: 0 }).andWhere('quantity', '>', 0) })
          .orWhere(function(){ this.where({ activity_id, shop_id, type: 4, status: 1, unlimit: 1 })}).transacting(trx);
      if(!discounts.length) {
        await db('activity').where({ id: activity.id }).update({status: 0}).transacting(trx);
      }
    });
  } catch(e){
    console.log(e);
    if(e && e.code){
      throw e
    } else {
      throw { code: 'GET_ACTIVITY_DISCOUNT_FAILED' }           
    }
  }
  
  return {
    body: 'OK'
  };

  } catch (err) {
    console.log(`activity.sendVoucher error: `, err);
    throw { body: err };
  }
}

function getEndTime(date, days=1){
  return new Date(new Date(date).getTime() + days * (24*60*60*1000)-1000);
}

function getUserLog(info){
  return {
    user_id: info.user_id,
    activity_id: info.activity_id,
    type: info.type,
    action: info.action || 0,
    bingo: info.bingo || 0,
    user_discount_id: info.user_discount_id,
  }
}

function getUserDiscount(activity, discount, info){

  let startTime, endTime, serialNum;
  
  if( activity.use_days || (activity.use_start_time && activity.use_end_time) ) {
    let todayLocal = new Date().toLocaleDateString();
    startTime = activity.use_days ? new Date(todayLocal) : activity.use_start_time;
    endTime = activity.use_days ? getEndTime(todayLocal, activity.use_days) : getEndTime(activity.use_end_time);
  }else {
    startTime = null;
    endTime = null;
  }

  // 自訂流水編號
  if( discount.use_serial_num ){
    serialNum = newSerialNum(discount.serial_num_setting || {}, info.tmp_serial_num)
  }

  function newSerialNum(setting, tmpNum){
    if(!setting.length){
      throw { code: "SERIAL_NUM_SETTING_LENGTH" }
    }
    return setting.prefix + paddingLeft(tmpNum.toString(), setting.length)
  }

  function paddingLeft(str, length){
    if(str.length >= length){
      return str;
    } else {
      return paddingLeft('0' + str, length);
    }
  }

  return {
    public_id: uuidv1(),
    user_id: info.user_id,
    shop_id: info.shop_id,
    sender: info.sender ? info.sender : null,
    activity_id: info.activity_id,
    discount_id: discount.id,
    discount_name: discount.name,
    start_time: startTime,
    end_time: endTime,
    serial_num: serialNum
  }
}

async function knexUpsert(trx, tableName, key, data, doThing='NOTHING') {
  try {
    return await db.raw(
      `? ON CONFLICT (${key.join(',')}) DO ${doThing} RETURNING *;`,
      [db(tableName).insert(data)]
    ).transacting(trx);
  } catch(e) {
    console.log(e);
    throw { code: `CREATE ${tableName.toUpperCase()} FAILED` }
  }
}

function checkSerialNumSetting(setting = {}) {
  if(typeof(setting.prefix) !== 'string'){
    throw { code: 'SERIAL_NUM_SETTING_ERROR', msg: 'prefix undefined' }
  }
  if(!setting.length){
    throw { code: 'SERIAL_NUM_SETTING_ERROR', msg: 'length undefined' }
  }
  if(!setting.start){
    throw { code: 'SERIAL_NUM_SETTING_ERROR', msg: 'start should be integer' }
  }
  if(!setting.end){
    throw { code: 'SERIAL_NUM_SETTING_ERROR', msg: 'end should be integer' }
  }
}

module.exports = {
  create,
  list,
  find,
  update,
  result,
  getDiscount,
  sendVoucher
};