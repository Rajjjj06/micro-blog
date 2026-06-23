CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    blog_id INTEGER NOT NULL,
    author_id SERIAL NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (blog_id) REFERENCES BLOG(id),
    FOREIGN KEY (author_id) REFERENCES user_profile(id)
)