import { Sequelize } from "sequelize-typescript";
import { Dialect } from "sequelize";
import winston from "winston";
import createLog from "../logger/createLog";

export interface DomainResource {
    sequelize: Sequelize;
    test: () => Promise<boolean>;
    domain: string;
    logger: winston.Logger;
}

const GDomainResources = {};

const getDomainDatabase = (domain: string): DomainResource => {
    if (domain in GDomainResources) {
        return GDomainResources[domain];
    }
    const logger = createLog(domain, "info");
    // eslint-disable-next-line prefer-const
    //const baseDir = path.join(__dirname, "./models");
    const { DB_CONNECTION, DB_HOST, DB_TIMEZONE, DB_PORT, DB_USER, DB_PASSWORD } = process.env;
    const sequelizeWithDomain = new Sequelize(domain, DB_USER, DB_PASSWORD, {
        host: DB_HOST,
        port: Number(DB_PORT),
        dialect: DB_CONNECTION as Dialect,
        timezone: DB_TIMEZONE,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        models: [__dirname + "/ts-models/*.model.ts"],
        logging: (msg) => {
            logger.info(msg);
        },
    });
    async function test(): Promise<boolean> {
        try {
            await sequelizeWithDomain.authenticate();
            return true;
        } catch (error) {
            //models.error = error;
            logger.error(`Unable to connect to the database: ${domain}`, error);
            return false;
        }
    }

    /*fs.readdirSync(baseDir)
    .filter((file) => {
      return (
        file.indexOf(".") !== 0 &&
        file !== "index.js" &&
        file.slice(-3) === ".js"
      );
    })
    .forEach((file) => {
      const model = require(path.join(baseDir, file))(
        sequelizeWithDomain,
        sequelize.DataTypes
      );
      models[model.name] = model;
    });

  /*Object.keys(models).forEach((modelName) => {
    if (models[modelName].associate) {
      models[modelName].associate(models);
    }
  });*/
    const domainResource = {
        sequelize: sequelizeWithDomain,
        test,
        domain,
        logger        
    };
    GDomainResources[domain] = domainResource;
    return domainResource;
};

export default getDomainDatabase;
