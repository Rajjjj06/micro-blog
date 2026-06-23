import pool from "../config/db.js";
import { asyncHandler } from "../middleware/handler.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import { TOPICS } from "../kafka/topics.js";
import producer from "../kafka/producer.js";
import imageQueue from "../worker/imageQueue.js";

export const createBlogCategory = asyncHandler(async (req, res) => {
  const userId = req.headers["x-user-id"];
  if (!userId) {
    return res.status(400).json({ error: "User ID is required in headers" });
  }
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  const result = await pool.query(
    `
            INSERT INTO blog_category (name, description)
            VALUES ($1, $2)
            RETURNING *
            `,
    [name, description],
  );
  res.status(201).json({
    message: "Blog category created successfully",
    data: result.rows[0],
  });
});

export const getAllBlogCategories = asyncHandler(async (req, res) => {
  const result = await pool.query("SELECT * FROM blog_category");
  res.status(200).json(result.rows);
});

export const createBlog = asyncHandler(async (req, res) => {
  const userId = req.headers["x-user-id"];

  if (!userId) {
    return res.status(400).json({
      error: "User ID is required in headers",
    });
  }

  const { title, content, category_id } = req.body;

  if (!title || !content || !category_id) {
    return res.status(400).json({
      error: "Title, content, and category_id are required",
    });
  }

  const result = await pool.query(
    `
      INSERT INTO blog (title, content, blog_category_id, authorId)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
    [title, content, category_id, userId],
  );

  if (req.file) {
    await imageQueue.add("uploadImage", {
      blogId: result.rows[0].id,
      filePath: req.file.buffer.toString("base64"),
    });
  }

  await producer.send({
    topic: TOPICS.BLOG_CREATED,
    messages: [
      {
        value: JSON.stringify({
          id: result.rows[0].id,
          title: result.rows[0].title,
          content: result.rows[0].content,
          blog_category_id: result.rows[0].blog_category_id,
          image_url: result.rows[0].image_url,
          author_id: result.rows[0].authorId,
        }),
      },
    ],
  });

  res.status(201).json({
    message: "Blog created successfully",
    data: result.rows[0],
  });
});

export const getAllBlogs = asyncHandler(async (req, res) => {
  const result = await pool.query(
    "SELECT b.id, b.title, b.content,b.image_url, c.name AS category_name, u.username as author_name, COUNT(cm.id) as total_comments from blog b JOIN user_profile u on b.authorId = u.id JOIN blog_category c on b.blog_category_id = c.id LEFT JOIN comments cm on b.id = cm.blog_id GROUP BY b.id, c.name, u.username ORDER BY b.created_at DESC",
  );
  const commentResult = await pool.query(
    `
    SELECT cm.id, cm.content, cm.created_at, u.username, cm.blog_id
    FROM comments cm
    JOIN user_profile u ON cm.author_id = u.id
    WHERE cm.blog_id IN (SELECT id FROM blog)
    ORDER BY cm.created_at DESC
    `,
  );
  res.status(200).json(result.rows, commentResult.rows);
});

export const getBlogById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const blogResult = await pool.query(
    `
  SELECT
      b.*,
      c.name AS category_name,
      u.username AS author_name
  FROM blog b
  JOIN user_profile u
      ON b.authorId = u.id
  JOIN blog_category c
      ON b.blog_category_id = c.id
  WHERE b.id = $1
  `,
    [id],
  );

  const commentsResult = await pool.query(
    `
  SELECT
      cm.id,
      cm.content,
      cm.created_at,
      u.username
  FROM comments cm
  JOIN user_profile u
      ON cm.author_id = u.id
  WHERE cm.blog_id = $1
  `,
    [id],
  );

  res.status(200).json({
    ...blogResult.rows[0],
    comments: commentsResult.rows,
  });
});

export const getUserBlogs = asyncHandler(async (req, res) => {
  const userId = req.headers["x-user-id"];
  if (!userId) {
    return res.status(400).json({ error: "User ID is required in headers" });
  }
  const result = await pool.query(
    "SELECT b.id, b.title, b.content,b.image_url, c.name AS category_name, u.username AS author_name, COALESCE(json_agg(json_build_object('id',cm.id, 'content', cm.content, 'created_at', cm.created_at, 'author_name', u2.username)) FILTER (WHERE cm.id IS NOT NULL), '[]') AS comments FROM blog b JOIN user_profile u ON b.authorId = u.id JOIN blog_category c ON b.blog_category_id = c.id LEFT JOIN comments cm ON b.id = cm.blog_id LEFT JOIN user_profile u2 ON cm.author_id = u2.id WHERE b.authorId = $1 GROUP BY b.id, c.name, u.username ORDER BY b.created_at DESC",
    [userId],
  );
  res.status(200).json(result.rows);
});

export const deleteBlog = asyncHandler(async (req, res) => {
  const userId = req.headers["x-user-id"];
  if (!userId) {
    return res.status(400).json({ error: "User ID is required in headers" });
  }
  const { id } = req.params;
  const result = await pool.query(
    "DELETE FROM blog WHERE id = $1 AND authorId = $2 RETURNING *",
    [id, userId],
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Blog not found or unauthorized" });
  }
  await producer.send({
    topic: TOPICS.BLOG_DELETED,
    messages: [
      {
        value: "Deleted blog with ID: " + id,
      },
    ],
  });
  res.status(200).json({
    message: "Blog deleted successfully",
    data: result.rows[0],
  });
});

export const updateBlog = asyncHandler(async (req, res) => {
  const userId = req.headers["x-user-id"];
  if (!userId) {
    return res.status(400).json({ error: "User ID is required in headers" });
  }
  const { id } = req.params;
  const { title, content, category_id } = req.body;
  const result = await pool.query(
    `
            UPDATE blog
            SET title = COALESCE($1, title), content = COALESCE($2, content), category_id = COALESCE($3, blog_category_id)
            WHERE id = $4 AND authorId = $5
            RETURNING *
            `,
    [title, content, category_id, id, userId],
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Blog not found" });
  }
  await producer.send({
    topic: TOPICS.BLOG_UPDATED,
    messages: [
      {
        value: JSON.stringify({
          id: result.rows[0].id,
          title: result.rows[0].title,
          content: result.rows[0].content,
          category_id: result.rows[0].category_id,
        }),
      },
    ],
  });
  res.status(200).json({
    message: "Blog updated successfully",
    data: result.rows[0],
  });
});

export const createComment = asyncHandler(async (req, res) => {
  const userId = req.headers["x-user-id"];
  if (!userId) {
    return res.status(400).json({ error: "User ID is required in headers" });
  }
  const { blogId } = req.params;
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: "Content is required" });
  }
  const result = await pool.query(
    `
            INSERT INTO comments (blog_id, author_id, content)
            VALUES ($1, $2, $3)
            RETURNING *
            `,
    [blogId, userId, content],
  );
  res.status(201).json({
    message: "Comment created successfully",
    data: result.rows[0],
  });
});

export const getUsersComments = asyncHandler(async (req, res) => {
  const userId = req.headers["x-user-id"];
  if (!userId) {
    return res.status(400).json({ error: "User ID is required in headers" });
  }
  const result = await pool.query(
    `
            SELECT cm.id, cm.content, cm.created_at, b.title AS blog_title
            FROM comments cm
            JOIN blog b ON cm.blog_id = b.id
            WHERE cm.authorId = $1
            ORDER BY cm.created_at DESC
        `,
    [userId],
  );
  res.status(200).json(result.rows);
});
