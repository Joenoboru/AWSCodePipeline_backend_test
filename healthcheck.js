const http = require("http");
const os = require('os');
const winLogger = require("./logger");

const options = {
    host: "localhost",
    port: process.env.PORT,
    timeout: 2000,
};
const mesasge = `[${os.hostname()}] http://${options.host}:${options.port}`
const request = http.request(options, (res) => {
    winLogger.info(`${mesasge} STATUS: ${res.statusCode}`);
    if (res.statusCode == 200) {
        process.exit(0);
    } else {
        process.exit(1);
    }
});

request.on("error", function (err) {
    winLogger.error(`${mesasge} Healthcheck ERROR`);
    process.exit(1);
});

request.end();
