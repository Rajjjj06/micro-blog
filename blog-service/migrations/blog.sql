CREATE TABLE BLOG(
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    authorId SERIAL NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    image_url TEXT,
    blog_category_id INTEGER,
    FOREIGN KEY (blog_category_id) REFERENCES blog_category(id),
    FOREIGN KEY (authorId) REFERENCES user_profile(id)
)