import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { authMiddleware } from "../middleware/auth.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
console.log("USER_SERVICE_URL:", process.env.USER_SERVICE_URL);

const protectedHandler = {
  proxyReq: (proxyReq, req) => {
    if (req.headers.cookie) {
      proxyReq.setHeader("cookie", req.headers.cookie);
    }
    if (req.user) {
      proxyReq.setHeader("x-user-id", req.user.id);
    }
  },
  proxyRes: (proxyRes, req, res) => {
    if (proxyRes.headers["set-cookie"]) {
      res.setHeader("set-cookie", proxyRes.headers["set-cookie"]);
    }
  },
};

const publicHandler = {
  proxyReq: (proxyReq, req) => {
    if (req.headers.cookie) {
      proxyReq.setHeader("cookie", req.headers.cookie);
    }
  },
  proxyRes: (proxyRes, req, res) => {
    if (proxyRes.headers["set-cookie"]) {
      res.setHeader("set-cookie", proxyRes.headers["set-cookie"]);
    }
  },
};

router.use(
  "/users/logout",
  authMiddleware,
  createProxyMiddleware({
    target: process.env.USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: () => `/api/users/logout`,
    on: protectedHandler,
  }),
);
router.use(
  "/users/profile",
  authMiddleware,
  createProxyMiddleware({
    target: process.env.USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: () => `/api/users/profile`,
    on: protectedHandler,
  }),
);

router.use(
  "/users",
  createProxyMiddleware({
    target: process.env.USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/api/users${path}`,
    on: publicHandler,
  }),
);

router.use(
  "/blog",
  authMiddleware,
  createProxyMiddleware({
    target: process.env.BLOG_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/api/blogs${path}`,
    on: protectedHandler,
  }),
);

router.use(
  "/notifications",
  authMiddleware,
  createProxyMiddleware({
    target: process.env.NOTIFICATION_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/api/notifications${path}`,
    on: protectedHandler,
  }),
);

export default router;
