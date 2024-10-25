"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = exports.initRedisConnection = void 0;
const redis_1 = require("redis");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Redis istemcisini oluşturuyoruz
const redisClient = (0, redis_1.createClient)({
    socket: {
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: Number(process.env.REDIS_PORT) || 6379,
    },
    password: process.env.REDIS_PASSWORD || undefined,
    database: Number(process.env.REDIS_DB) || 0, // Redis veritabanı
});
exports.redisClient = redisClient;
// Redis bağlantı hatalarını dinliyoruz
redisClient.on("error", (err) => {
    console.error("Redis connection error:", err);
});
// Redis bağlantısı kurulduğunda bilgilendirme yapıyoruz
redisClient.on("connect", () => {
    console.log("Connected to Redis");
});
// Redis bağlantısını başlatıyoruz
const initRedisConnection = async () => {
    try {
        await redisClient.connect(); // Modern `node-redis`'te bağlantı için `connect` kullanılır
        console.log("Redis connection established.");
    }
    catch (error) {
        console.error("Failed to connect to Redis:", error);
    }
};
exports.initRedisConnection = initRedisConnection;
