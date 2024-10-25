import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

// Redis istemcisini oluşturuyoruz
const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379,
  },
  password: process.env.REDIS_PASSWORD || undefined,
  database: Number(process.env.REDIS_DB) || 0, // Redis veritabanı
});

// Redis bağlantı hatalarını dinliyoruz
redisClient.on("error", (err) => {
  console.error("Redis connection error:", err);
});

// Redis bağlantısı kurulduğunda bilgilendirme yapıyoruz
redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

// Redis bağlantısını başlatıyoruz
export const initRedisConnection = async () => {
  try {
    await redisClient.connect(); // Modern `node-redis`'te bağlantı için `connect` kullanılır
    console.log("Redis connection established.");
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
  }
};

export { redisClient };
