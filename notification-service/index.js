import express from "express";
import dotenv from "dotenv";
import pool from "./config/db.js";
import startConsumer from "./kafka/consumer.js";
import { errorHandler } from "./middleware/errorHandler.js";
import notificationRoute from "./route/NotificationRoute.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT;
app.use(express.json());
app.use("/api/notifications", notificationRoute);
app.use(errorHandler);
const startServer = async () => {
  await pool.query("SELECT 1");
  console.log("Connected to the database");
  await startConsumer();
  app.listen(PORT, () => {
    console.log(`Notification service is running on port ${PORT}`);
  });
};

startServer();
