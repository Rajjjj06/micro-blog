import { Queue } from "bullmq";
import redis from "../config/redis.js";

const imageQueue = new Queue("imageQueue", {
  connection: redis,
});

export default imageQueue;
