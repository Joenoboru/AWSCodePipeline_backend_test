import express from "express";
import SocketIO from "socket.io";
import redis, { ClientOpts as RedisClientOpts, RedisClient } from "redis";
import winLogger from "../logger";

const {
    SESSION_DB_CONNECTION,
    SESSION_DB_HOST,
    SESSION_DB_PORT,
    //SESSION_DB_USER,
    //SESSION_DB_PASSWORD,
    //SESSION_DB_DATABASE,
} = process.env;
const io = SocketIO();
let subscriber: RedisClient = null;
const redisConfig: RedisClientOpts = {
    host: SESSION_DB_HOST,
    port: Number(SESSION_DB_PORT),
};
if (SESSION_DB_CONNECTION === "redis") {
    const redisAdapter = require("socket.io-redis");
    io.adapter(redisAdapter(redisConfig));
    subscriber = redis.createClient(redisConfig);
    subscriber.on("message", function (channel, message) {
        const messageData = JSON.parse(message);
        // console.log(channel, messageData);
        const roster = io.sockets.clients(null);
        for (const socketId in roster.sockets) {
            const socket = roster.sockets[socketId];
            try {
                if (socket.handshake.session.passport) {
                    if (socket.handshake.session.passport.user.email === messageData.email) {
                        // console.log('find user');
                        socket.emit("msgReceived", `find.`);
                    }
                }
            } catch (e) {
                // console.error(e);
            }
            // console.log('Username: ' + roster[i]);
        }
    });
    subscriber.subscribe("notification");
}
function sio(io: SocketIO.Server) {
    const router = express.Router();
    express.request;
    io.on("connection", function (socket) {
        try {
            console.log("connected");
            if (socket.handshake.session.passport && socket.handshake.session.passport.user) {
                const user = socket.handshake.session.passport.user;
                socket.emit("msgReceived", `${user.email} is connected`);
            } else {
                // console.log('connected');
                socket.emit("msgReceived", `annymousis connected`);
            }
            socket.on("message", function (msg) {
                // console.log('message: ' + msg);
            });
            socket.on("online", function (msg) {
                // console.log('message: ' + msg);
            });
            socket.on("updateMessage", function (msg) {
                // console.log('message: ' + msg);
            });
        } catch (e) {
            winLogger.error(e);
        }
    });

    return router;
}
const sioRouter = sio(io);
const publish = (messageBody: any) => {
    if (SESSION_DB_CONNECTION === "redis") {
        const publisher = redis.createClient(redisConfig);
        publisher.publish("notification", JSON.stringify(messageBody), function (e) {
            // console.log(e);
        });
    }
};

export { io, sioRouter, publish };
