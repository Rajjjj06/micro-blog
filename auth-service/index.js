import express from "express";
import dotenv from "dotenv";
import { pool } from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";
import userRoutes from "./routes/UserRoutes.js";
import { connectProducer } from "./kafka/producer.js";
dotenv.config();

const app = express();

app.use(express.json());
app.use((req, res, next) => {
  console.log(
    req.method,

    req.originalUrl,
  );

  next();
});
app.use("/api/users", userRoutes);

app.use(errorHandler);
const PORT = process.env.PORT;

const startServer = async () => {
  try {
    await pool.connect();
    console.log("Connected to the database successfully.");
    await connectProducer();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
};

startServer();
