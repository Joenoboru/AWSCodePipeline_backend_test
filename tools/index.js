const path = require('path')
const fs = require('fs');
const Hashids = require('hashids/cjs');
const request = require('request');

module.exports = {
  request: async function(inputs){
    /**
      input: {
        method: String [GET/POST/PUT/DELETE],
        url: String,
        form: Object,
        json: Object,
        headers: Object,
        sync: Boolean [true/false],
        jsonParse: Boolean [true/false]
      }
    */

    try {
      const options = {
        method: inputs.method,
        url: inputs.url,
        form: inputs.form,
        json: inputs.json,
        headers: inputs.headers
      } 

      if (inputs.sync){
        // return without await
        request(options)
        return;

      } else {
        // return after request callback
        return new Promise((resolve, reject) => {
          request(options, (err, response, body) => {
            if (err) {
              reject({ code: 'send request failed'}) 
            } else {
              resolve( inputs.jsonParse ? JSON.parse(body) : body )
            }
          })
        })
      }
    } catch (err) {
      sails.log.error(`send request error: ${error}`)
      throw err;
    }
  },
  indexBilder: function(dirname, folderName){
    const ApiJson = {};
    fs.readdirSync(dirname + folderName).forEach( file => {
      let extname = path.extname(file)
      if(extname == '.js' && file !== 'index.js'){
        let fileName = path.basename(file, extname)
        ApiJson[fileName] = require( dirname + folderName + fileName)
      } 
    })
    return ApiJson
  },
  convertArrayToObject: function(array, key){
    const initialValue = {};
    return array.reduce((obj, item) => {
      return {
        ...obj,
        [item[key]]: item,
      };
    }, initialValue);
  },
  convertArrayToObjWithArray: function(array=[], key){
    const initialValue = [];
    return array.reduce((obj, item) => {
      return {
        ...obj,
        [item[key]]: (obj[item[key]] ? obj[item[key]].concat(item) : [item]),
      };
    }, initialValue);
  },
  generateCode: async function(salt, id, initialText) {
    let hashids = new Hashids(salt+initialText, 10, '23456789ABCDEFGHJKLMNPQRSTUVWXYZ');
    let code = initialText + hashids.encode(id);
    return code
  },
  getActLog: function(activity_id, shop_id){
    return {
      activity_id,
      shop_id,
      type: 3, 
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1, 
      day: new Date().getDate()
    }
  },
  encodeUserToken: async function(salt, id, expireTime) {
    let hashids = new Hashids(salt, 10, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789');
    let data = Buffer(id.toString() + ',' + expireTime.toString()).toString('hex');
    let encode = hashids.encodeHex(data);
    return encode
  },
  decodeUserToken: async function(salt, userToken) {
    const hashids = new Hashids(salt, 10, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789');
    let decode = hashids.decodeHex(userToken);
    decode = Buffer(decode, 'hex').toString('utf8');
    return decode
  },
  parseSESContent : async function (input){
    try {

      let params = { 
        Source: input.sender, 
        Destination: { 
          ToAddresses: input.emails 
        },
        Message: {
          Subject: {
            Data: input.title, Charset: "UTF-8"
          },
          Body: {
            Text: { 
              Data: input.content
            }
          }
        }
      };

      return params;

    } catch (err) {
      console.log(`tools.parseSESContent error: `, err);
      throw err;
    }
  }  
}
