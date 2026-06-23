import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redis = new IORedis({
  host: process.env.REDIS_HOST || "redis",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
});

redis.on("error", (err) => {
  console.error("Redis Client Error", err);
});
redis.on("connect", () => {
  console.log("Redis Client Connected");
});

export default redis;
