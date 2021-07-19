import express, { Request, Response } from "express";
import promBundle from "express-prom-bundle";
import fileUpload from "express-fileupload";
import paginate from "express-paginate";
import createError from "http-errors";
import cookieParser from "cookie-parser";
import sharedsession from "express-socket.io-session";
import i18next from "i18next";
import i18nextMiddleware from "i18next-http-middleware";
// import Backend from "i18next-node-fs-backend";
import logger from "morgan";
import helmet from "helmet";
import cors from "cors";
import path from "path";
import winLogger from "./logger";
import session from "./session";
import passport from "./authPassport";
import indexRouter from "./routes/index";
import apiRouter from "./routes/api";
import authRouter from "./routes/auth";
import { io, sioRouter } from "./socketio";
import i18n_zh from "./wf_common/i18n/zh-TW.json";
import i18n_ja from "./wf_common/i18n/ja-JP.json";
import getCommonDatabase from './common-database'

require("app-module-path").addPath(__dirname);
require("dotenv").config();

winLogger.info(`future manager init.`);

const app = express();
const metricsMiddleware = promBundle({ includeMethod: true });
app.use(metricsMiddleware);
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(cors());
app.use(helmet());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(paginate.middleware(10, 50));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public_example")));
app.use(
    fileUpload({
        createParentPath: true,
    })
);
app.set("trust proxy", 1); // trust first proxy
//===== Configuring Session Start ==========
app.use(session);
io.use(sharedsession(session));
//===== Configuring Session End ==========

//===== Configuring Passport Start ==========
getCommonDatabase();
app.use(passport.initialize());
app.use(passport.session());
//===== Configuring Passport End ==========

//==========================================
i18next.use(i18nextMiddleware.LanguageDetector).init({
    resources: {
        "zh-TW": {
            translation: i18n_zh,
        },
        zh: {
            translation: i18n_zh,
        },
        ja: {
            translation: i18n_ja,
        },
        "ja-JP": {
            translation: i18n_ja,
        },
    },
    debug: false,
    detection: {
        lookupCookie: "lang",
        caches: ["cookie"],
    },
    preload: ["zh-TW", "ja-JP"],
    saveMissing: true,
    fallbackLng: ["zh-TW"],
});

app.use(i18nextMiddleware.handle(i18next));
//============================================
app.use("/", indexRouter);
app.use("/", sioRouter);
app.use("/api", apiRouter);
app.use("/auth", authRouter);

//app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err: any, req: Request, res: Response /*next*/) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

export { app, io, winLogger };
