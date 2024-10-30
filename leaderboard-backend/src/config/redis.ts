import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || "51.20.78.86",
    port: Number(process.env.REDIS_PORT) || 6379,
  },
  password: process.env.REDIS_PASSWORD || undefined,
  database: Number(process.env.REDIS_DB) || 0,
});

redisClient.on("error", (err) => {
  console.error("Redis connection error:", err);
});

redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

export const initRedisConnection = async () => {
  try {
    await redisClient.connect();
    console.log("Redis connection established.");
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
  }
};

export { redisClient };

