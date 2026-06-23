import { pool } from "../config/db.js";
import { asyncHandler } from "../middleware/handler.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";
import { TOPICS } from "../kafka/topic.js";
import producer from "../kafka/producer.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
            INSERT INTO users (username,email,password)
            VALUES ($1,$2,$3)   
            RETURNING id, username, email, created_at

            `,
    [username, email, hashedPassword],
  );
  const user = result.rows[0];
  await producer.send({
    topic: TOPICS.USER_CREATED,
    messages: [
      {
        value: JSON.stringify({
          id: user.id,
          username: user.username,
        }),
      },
    ],
  });
  const token = generateToken({ id: user.id });
  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 1000,
  });
  res.status(201).json({
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.created_at,
    message: "User registered successfully",
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const doesUserExist = await pool.query(
    `
            SELECT id, password FROM users WHERE email = $1`,
    [email],
  );
  if (doesUserExist.rowCount === 0) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  const user = doesUserExist.rows[0];
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  const token = generateToken({ id: user.id });
  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 1000,
  });
  res.status(200).json({ message: "Logged in successfully" });
});

export const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.headers["x-user-id"];
  const result = await pool.query(
    `
            SELECT id FROM users WHERE id = $1
            `,
    [userId],
  );
  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "User not found",
    });
  }
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
});

export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.headers["x-user-id"];
  const result = await pool.query(
    `
            SELECT id, username, email, created_at as createdAt FROM users WHERE id = $1
            `,
    [userId],
  );
  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "User not found",
    });
  }
  const user = result.rows[0];
  res.status(200).json(user);
});
