"use strict";

const fs = require("fs");
const path = require("path");
const sequelize = require("sequelize");
const createLog = require("../logger/createLog").default;
// eslint-disable-next-line prefer-const
const GDomainResources = {};
// const db_live_check = async () => {
//     for (const key in all_database) {
//         all_database[key].test().then(pass => {
//             winLogger.info(`${all_database[key].domain}: connect ${pass}`)
//             if (!pass) {
//                 delete all_database[key];
//             }
//         })
//     }
// }
// setInterval(db_live_check, 30 * 60 * 1000);
const getDomainDatabase = (domain) => {
    if (domain in GDomainResources) {
        return GDomainResources[domain];
    }
    const logger = createLog(domain, "info");
    // eslint-disable-next-line prefer-const
    let models = {};

    const { DB_CONNECTION, DB_HOST, DB_TIMEZONE, DB_PORT, DB_USER, DB_PASSWORD } = process.env;
    const sequelizeWithDomain = new sequelize(domain, DB_USER, DB_PASSWORD, {
        host: DB_HOST,
        port: DB_PORT,
        dialect: DB_CONNECTION,
        timezone: DB_TIMEZONE,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        logging: (msg) => logger.info(msg),
    });
    async function test() {
        try {
            await sequelizeWithDomain.authenticate();
            return true;
        } catch (error) {
            models.error = error;
            logger.error(`Unable to connect to the database: ${domain}`, error);
            return false;
        }
    }
    // test();
    const baseDir = path.join(__dirname, "./models");
    fs.readdirSync(baseDir)
        .filter((file) => {
            return file.indexOf(".") !== 0 && file !== "index.js" && file.slice(-3) === ".js";
        })
        .forEach((file) => {
            const model = require(path.join(baseDir, file))(sequelizeWithDomain, sequelize.DataTypes);
            models[model.name] = model;
        });

    Object.keys(models).forEach((modelName) => {
        if (models[modelName].associate) {
            models[modelName].associate(models);
        }
    });
    const domainResource = {
        sequelize: sequelizeWithDomain,
        test,
        domain,
        logger,
        ...models,
    };
    GDomainResources[domain] = domainResource;
    return domainResource;
};
module.exports = getDomainDatabase;
