import { Worker } from "bullmq";
import redis from "../config/redis.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import pool from "../config/db.js";

console.log("Image worker started");

const imageWorker = new Worker(
  "imageQueue",
  async (job) => {
    console.log("Job received:", job.data);

    const { blogId, filePath } = job.data;

    const buffer = Buffer.from(filePath, "base64");

    const uploadResult = await uploadToCloudinary(buffer);

    console.log("Uploaded to Cloudinary:", uploadResult.secure_url);

    await pool.query(
      `
      UPDATE blog
      SET image_url = $1
      WHERE id = $2
      `,
      [uploadResult.secure_url, blogId],
    );

    console.log("Blog updated:", blogId);
  },
  { connection: redis },
);

imageWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

imageWorker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

export default imageWorker;
