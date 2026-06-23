import fs from "fs";
import pool from "./config/db.js";

const migrations = [
  "./migrations/user_profile.sql",
  "./migrations/blog_category.sql",
  "./migrations/blog.sql",
  "./migrations/comments.sql",
];

try {
  for (const file of migrations) {
    const sql = fs.readFileSync(file, "utf-8");
    await pool.query(sql);
    console.log(`${file} migrated successfully`);
  }

  console.log("All migrations completed successfully");
  process.exit(0);
} catch (error) {
  console.error("Migration failed:", error);
  process.exit(1);
}
