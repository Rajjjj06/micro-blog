import fs from "fs";
import { pool } from "./config/db.js";

const migrate = fs.readFileSync("./migrations/auth.sql", "utf-8");
await pool.query(migrate);
console.log("Migration completed successfully");
process.exit(0);
