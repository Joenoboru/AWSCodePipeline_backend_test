import { Sequelize } from "sequelize-typescript";
import { Dialect } from "sequelize";
import winston from "winston";
import createLog from "../logger/createLog";

export interface CommonResource {
    sequelize: Sequelize;
    test: () => Promise<boolean>;
    logger: winston.Logger;
}

const getCommonDatabase = (): CommonResource => {
    const { DB_CONNECTION, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE, DB_COMMON_DATABASE, DB_TIMEZONE } =
        process.env;
    const logger = createLog("common database", "info");
    const sequelizeCommonDB = new Sequelize(
        DB_COMMON_DATABASE ? DB_COMMON_DATABASE : DB_DATABASE,
        DB_USER,
        DB_PASSWORD,
        {
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
        }
    );
    async function test() {
        try {
            await sequelizeCommonDB.authenticate();
            //console.log('Connection has been established successfully.');
            return true;
        } catch (error) {
            //models.error = error;
            logger.error("Unable to connect to the database:", error);
            return false;
        }
    }
    //test();
    /*const modelsDir = path.join(__dirname, "models/");
    fs.readdirSync(modelsDir)
        .filter((file) => {
            return file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js";
        })
        .forEach((file) => {
            const model = require(path.join(modelsDir, file))(sequelizeCommonDB, sequelize.DataTypes);
            models[model.name] = model;
        });

    Object.keys(models).forEach((modelName) => {
        if (models[modelName].associate) {
            models[modelName].associate(models);
        }
    });*/

    const commonResources = {
        sequelize: sequelizeCommonDB,
        test,
        logger,
    };
    return commonResources;
};
export default getCommonDatabase;
