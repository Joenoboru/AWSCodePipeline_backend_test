//log日誌,預設檔設定
import winston from "winston";
import sequelize from "sequelize";
import "winston-daily-rotate-file";

const { combine /*timestamp, prettyPrint*/ } = winston.format;
const SequelError = sequelize.Error;

const logFormat = winston.format.printf(function (info) {
    const date = new Date().toISOString();
    // console.log(info);
    let defaultMessage = `${date}-${info.level}: ${JSON.stringify(info.message, null, 4)}\n`;
    if (info instanceof Error) {
        defaultMessage += info.stack;
    }
    if (info instanceof SequelError) {
        defaultMessage += "\n" + info.sql;
    }
    // if (info.meta.stack) {
    //   defaultMessage += `:${info.meta.stack}`;
    // }
    return defaultMessage;
});

export default function createLog(dirName: string, logLevel: string, options?: any): winston.Logger {
    let _default = {
        DailyRotateFileOptions: {
            filename: `./logs/${dirName}/%DATE%.log`,
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "10m", //控制紀錄檔檔案大小,達到大小更換檔案
            maxFiles: "7d", //控制紀錄檔檔案天數,達到天數更換檔案
        },
        DailyRotateFileOptionsError: {
            level: "error",
            filename: `./logs/${dirName}/%DATE%.error.log`,
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "10m", //控制紀錄檔檔案大小,達到大小更換檔案
            maxFiles: "7d", //控制紀錄檔檔案天數,達到天數更換檔案
        },
        timestampOptions: {
            format: "YYYY-MM-DD HH:mm:ss",
        },
        ConsoleOptions: {},
    };
    _default = Object.assign(_default, options);
    const { DailyRotateFileOptionsError, DailyRotateFileOptions, /*timestampOptions,*/ ConsoleOptions } = _default;
    return winston.createLogger({
        level: logLevel,
        format: combine(
            // errorStackFormat(),
            logFormat
        ),
        transports: [
            new winston.transports.Console(ConsoleOptions),
            // new (winston.transports.Console)({ level: 'error' }), 可自定義要輸出的日誌等級
            new winston.transports.DailyRotateFile(DailyRotateFileOptionsError),
            new winston.transports.DailyRotateFile(DailyRotateFileOptions),
        ],
    });
}
