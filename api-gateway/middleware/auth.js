import { verifyToken } from "../utils/jwt.js";

export const authMiddleware = (req, res, next) => {
  const cookieHeader = req.cookies.token;
  if (!cookieHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = cookieHeader;
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: err });
  }
};
