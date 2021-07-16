import session from "express-session";
import connectRedis from "connect-redis";
import redis from "redis";
require("dotenv").config();
// const env = process.env.NODE_ENV || "development";

const {
  SESSION_DB_CONNECTION,
  SESSION_DB_HOST,
  SESSION_DB_PORT,
  SESSION_DB_USER,
  SESSION_DB_PASSWORD,
  SESSION_DB_DATABASE,
} = process.env;
let useSessionStore = null;
if (SESSION_DB_CONNECTION === "redis") {
  const RedisStore = connectRedis(session);
  const client = redis.createClient({
    host: SESSION_DB_HOST,
    port: Number(SESSION_DB_PORT),
  });
  const sessionStore = new RedisStore({
    host: SESSION_DB_HOST,
    port: Number(SESSION_DB_PORT),
    client: client,
    ttl: 260,
  });
  useSessionStore = sessionStore;
} else if (
  SESSION_DB_CONNECTION === "mariadb" ||
  SESSION_DB_CONNECTION === "mysql"
) {
  const MySQLStore = require("express-mysql-session")(session);
  const setting = {
    // Host name for database connection:
    host: SESSION_DB_HOST,
    // Port number for database connection:
    port: SESSION_DB_PORT,
    // Database user:
    user: SESSION_DB_USER,
    // Password for the above database user:
    password: SESSION_DB_PASSWORD,
    // Database name:
    database: SESSION_DB_DATABASE,
    expiration: 10800000,
    createDatabaseTable: true, //是否創建表
    schema: {
      tableName: "login_sessions", //表名
      columnNames: {
        //列選項
        session_id: "session_id",
        expires: "expires",
        data: "data",
      },
    },
  };

  const sessionStore = new MySQLStore(setting);
  useSessionStore = sessionStore;
}

const app_session = session({
  //key: "future-manager",
  secret: "mirai-network.com",
  store: useSessionStore,
  resave: false,
  saveUninitialized: true,
  rolling: true,
  name: "future-manager",
  cookie: {
    maxAge: parseInt(process.env.SESSION_TIME) * 1000,
    secure: false, //只用HTTPS
  },
});

export default app_session;
