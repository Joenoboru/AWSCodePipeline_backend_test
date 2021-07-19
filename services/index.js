// const fs = require("fs");

// let services = {};

// fs.readdirSync(__dirname)
//     .filter((file) => {
//         return file.indexOf(".") < 0;
//     })
//     .forEach((file) => {
//         const sObj = require(`./${file}`);
//         services[file] = sObj;
//     });

// module.exports = services;

const AuditService = require('./AuditService');

module.exports = { 
    AuditService,
};
