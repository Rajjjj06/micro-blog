import express from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  createBlogCategory,
  getAllBlogCategories,
  getUserBlogs,
  getUsersComments,
  createComment,
} from "../controllers/BlogController.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post("/categories", createBlogCategory);
router.get("/categories", getAllBlogCategories);
router.post("/", upload.single("image"), createBlog);
router.get("/", getAllBlogs);
router.get("/:id", getBlogById);
router.put("/:id", updateBlog);
router.delete("/:id", deleteBlog);
router.get("/user/:userId", getUserBlogs);
router.get("/comments/user/:userId", getUsersComments);
router.post("/:blogId/comments", createComment);

export default router;
