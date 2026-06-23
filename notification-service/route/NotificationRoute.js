import express from "express";
import { getNotification } from "../controller/NotificationController.js";

const router = express.Router();

router.get("/", getNotification);

export default router;
