let schema = {}

readdir('/', '')

module.exports = schema

function readdir (route, field) {
  try {

    if(!route) {
      return schema
    }

    require('fs').readdirSync(__dirname + route).forEach(function(file) {
      let fileTmp = file.split('.')
      let fileName = fileTmp[0]
      let fileType = fileTmp[1]

      // 檔案所在路徑 route: 資料夾的位置, field: 在 schema 物件中的位置
      let subRoute = route === '/' ? ( route + fileName ) : ( route + '/' + fileName );
      let subField = field === '' ? ( field + fileName ) : ( field + '.' + fileName );
      // 沒有副檔名表示為資料夾，繼續讀取裡面的資料
      if( !fileType ){ 
        readdir(subRoute, subField);
      }

      // 如是json檔則讀取資料塞入 schema 物件中
      if( fileType === 'json' ){ 
        let keys = subField.split('.'); // 得到此檔案在 schema 物件中的 keys
        let obj = schema;
        for( let i=0; i<keys.length; i++ ){ // 建立 schema 物件中每一層的 key
          let key = keys[i]

          if( !obj[key] ) {
            obj[key] = {}
          }
          if ( i === (keys.length-1) ) {
            // 如果是最後一層則塞入 json 檔中的資料
            obj[key] = require(__dirname + route + '/' + file);
          } else {
            // 如果不是最後一層則將此層塞入目標物件
            obj = obj[key];
          }
        }
      }
    });

  } catch (err) {
  	console.error('Parse Validation Schema Failed', err)
    return {};
  }
}