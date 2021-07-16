//log使用範例
import createLog from './createLog';
const logger = createLog('fm','info');

// logger.on('rotate', function(oldFilename, newFilename) {
//     // do something
//     // console.log(oldFilename);
//     // console.log(newFilename);
// });
//可自由製作成模組
export default logger;
// //用法：
// try{
//     logger.info('456789');
//     var a = {
//         b:'asdf'
//     }
//     var a = {
//         b:xcvbnmdsfghj
//     }
    
// }catch (ex) {
//     logger.error(`message - ${ex.message}, stack trace - ${ex.stack}`);
// }
