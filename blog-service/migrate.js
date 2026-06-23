import fs from "fs";
import pool from "./config/db.js";

const migrations = ["./migrations/comments.sql"];

for (const file of migrations) {
  const migrate = fs.readFileSync(file, "utf-8");
  await pool.query(migrate);
  console.log("Migration completed successfully");
  process.exit(0);
}
