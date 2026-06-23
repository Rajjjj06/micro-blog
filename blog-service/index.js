import express from "express";
import dotenv from "dotenv";
import pool from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";
import blogRoutes from "./routes/BlogRoutes.js";
import { connectConsumer } from "./kafka/consumer.js";
import { connectProducer } from "./kafka/producer.js";
import imageWorker from "./worker/imageWorker.js";
dotenv.config();

const app = express();
app.use(express.json());
app.use("/api/blogs", blogRoutes);
app.use(errorHandler);

const PORT = process.env.PORT;

const startServer = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("Connected to the database successfully.");
    await connectProducer();
    await connectConsumer();
    app.listen(PORT, () => {
      console.log(`Blog Service is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect to the database:", err);
    process.exit(1);
  }
};

startServer();
