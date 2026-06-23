import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import gatewayRoutes from "./routes/GatewayRoutes.js";
dotenv.config();

const app = express();

app.use(cookieParser());
app.use("/api", gatewayRoutes);
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
});
