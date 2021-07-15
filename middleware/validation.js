const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });
const schemaList = require('../schema/index.js');

module.exports = async function(plugin, name, identity, body) {
  try {
    
    let pluginSchema = (schemaList[plugin] || {} )[name]
    // 例：沒有 user/login 資料夾，則代表 user.login 不需檢查，直接返回 body
    if(!pluginSchema){
      return body
    }

    let schema = pluginSchema[identity]

    // 例：有 user/login 資料夾，但沒有該 identity 所屬的資料夾，代表無權限丟入任何資料，所以 return 空物件
    if(!(schema && schema['input'])){
      return;
    }

    let validate = ajv.compile(schema['input']);

    if(!validate(body)){
      let description = validate.errors.map(e => '[' + e.keyword.toUpperCase() + '] ' + (e.dataPath ? '(' + e.dataPath.slice(1) + ') ' : '') + e.message);
      throw { status: 403, body: { code: 'INPUT_DATA_ERROR' , description: description} };
    }

    return body;

  } catch (err) {
    throw err
  }
  
}
