import pool from "../config/db.js";
import { asyncHandler } from "../middleware/handler.js";

export const getNotification = asyncHandler(async (req, res) => {
  const userId = req.headers["x-user-id"];
  if (!userId) {
    return res.status(400).json({ error: "User ID is required in headers" });
  }
  const result = await pool.query(
    "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC",
    [userId],
  );
  res.json(result.rows);
});
