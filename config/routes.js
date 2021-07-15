module.exports = {
  user:{
    list: { method: 'get', path: '/list', type: [2] },
    listExportExcel: { method: 'get', path: '/listExportExcel', type: [2] },
    find: { method: 'get', path: '/:public_id', type: [2, 3] },
    login: { method: 'post', path: '/login', type: [4] },
    update: { method: 'put', path: '/:public_id', type: [3] }
  },
  shop:{
    tempdashboard: { method: 'get', path: '/tempdashboard', type: [4] },
    list: { method: 'get', path: '/list', type: [3, 4] },
    excelExport: { method: 'get', path: '/excelExport', type: [2] },
    userDiscountExport: { method: 'get', path: '/userDiscountExport', type: [2] },
    find: { method: 'get', path: '/:public_id', type: [2] },
    login: { method: 'post', path: '/login', type: [4] },
    update: { method: 'put', path: '/:public_id', type: [2] },
    
  },
  shopBranch:{
    create: { method: 'post', path: '/', type: [2] },
    list: { method: 'get', path: '/list', type: [2] },
    update: { method: 'put', path: '/:public_id', type: [2] }
  },
  activity:{
    create: { method: 'post', path: '/', type: [2] },
    list: { method: 'get', path: '/list', type: [2, 3, 4] },
    result: { method: 'get', path: '/result', type: [3] },
    getDiscount: { method: 'get', path: '/getDiscount', type: [3] },
    sendVoucher: { method: 'post', path: '/sendVoucher', type: [2] },
    find: { method: 'get', path: '/:public_id', type: [2, 3, 4] },
    update: { method: 'put', path: '/:public_id', type: [2] }
  },
  activityType:{
    list: { method: 'get', path: '/list', type: [2] }
  },
  statistics:{
    info: { method: 'get', path: '/', type: [2] }
  },
  userDiscount:{
    list: { method: 'get', path: '/list', type: [2, 3] },
    find: { method: 'get', path: '/:id', type: [3] },
    writeoff: { method: 'put', path: '/writeoff', type: [2] },
    update: { method: 'put', path: '/:id', type: [3] }
  },
  discount:{
    list: { method: 'get', path: '/list', type: [2] }
  },
  notice:{
    list: { method: 'get', path: '/list', type: [2, 3] },
    find: { method: 'get', path: '/:id', type: [2, 3] },
    create: { method: 'post', path: '/', type: [2] },
    update: { method: 'put', path: '/:id', type: [2, 3] },
    remove: { method: 'delete', path: '/:id', type: [2] }
  },
  tag:{
    create: { method: 'post', path: '/', type: [1, 2] },
    list: { method: 'get', path: '/list', type: [1, 2] },
    find: { method: 'get', path: '/:id', type: [1, 2] },
    update: { method: 'put', path: '/:id', type: [1, 2] },
    remove: { method: 'delete', path: '/:id', type: [1, 2] }
  }
}
