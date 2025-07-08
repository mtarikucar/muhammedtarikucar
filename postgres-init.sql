-- PostgreSQL initialization script
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create database if it doesn't exist (this is usually handled by POSTGRES_DB env var)
-- SELECT 'CREATE DATABASE blog_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'blog_db')\gexec

-- Connect to the blog database
\c blog_db;

-- Create enum types
CREATE TYPE user_gender AS ENUM ('male', 'female', 'not selected');
CREATE TYPE user_role AS ENUM ('member', 'admin');
CREATE TYPE post_status AS ENUM ('draft', 'published', 'archived');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    image VARCHAR(255),
    gender user_gender DEFAULT 'not selected',
    bio TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "communityId" UUID,
    password VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'member',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(255) UNIQUE,
    description VARCHAR(200) DEFAULT '',
    color VARCHAR(7) DEFAULT '#3B82F6',
    icon VARCHAR(50) DEFAULT 'folder',
    image VARCHAR(255),
    "isActive" BOOLEAN DEFAULT true,
    "sortOrder" INTEGER DEFAULT 0,
    "postCount" INTEGER DEFAULT 0,
    seo JSONB DEFAULT '{}',
    "createdById" UUID NOT NULL,
    "updatedById" UUID,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create communities table
CREATE TABLE IF NOT EXISTS communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image VARCHAR(255),
    address VARCHAR(255),
    "ownerId" UUID NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt VARCHAR(300) NOT NULL,
    "featuredImage" VARCHAR(255),
    images JSONB DEFAULT '[]',
    "categoryId" UUID NOT NULL,
    tags TEXT[],
    "authorId" UUID NOT NULL,
    status post_status DEFAULT 'draft',
    "publishedAt" TIMESTAMP WITH TIME ZONE,
    views INTEGER DEFAULT 0,
    "viewHistory" JSONB DEFAULT '[]',
    "readingTime" INTEGER DEFAULT 1,
    seo JSONB DEFAULT '{}',
    likes INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    "relatedPosts" UUID[],
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    "adminId" UUID,
    image VARCHAR(255),
    "communityId" UUID,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message TEXT NOT NULL,
    "roomId" UUID NOT NULL,
    "senderId" UUID NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create junction tables for many-to-many relationships
CREATE TABLE IF NOT EXISTS user_rooms (
    "userId" UUID NOT NULL,
    "roomId" UUID NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY ("userId", "roomId")
);

CREATE TABLE IF NOT EXISTS user_post_likes (
    "userId" UUID NOT NULL,
    "postId" UUID NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY ("userId", "postId")
);

-- Add foreign key constraints
ALTER TABLE users ADD CONSTRAINT fk_users_community 
    FOREIGN KEY ("communityId") REFERENCES communities(id) ON DELETE SET NULL;

ALTER TABLE categories ADD CONSTRAINT fk_categories_created_by 
    FOREIGN KEY ("createdById") REFERENCES users(id) ON DELETE RESTRICT;

ALTER TABLE categories ADD CONSTRAINT fk_categories_updated_by 
    FOREIGN KEY ("updatedById") REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE communities ADD CONSTRAINT fk_communities_owner 
    FOREIGN KEY ("ownerId") REFERENCES users(id) ON DELETE RESTRICT;

ALTER TABLE posts ADD CONSTRAINT fk_posts_category 
    FOREIGN KEY ("categoryId") REFERENCES categories(id) ON DELETE RESTRICT;

ALTER TABLE posts ADD CONSTRAINT fk_posts_author 
    FOREIGN KEY ("authorId") REFERENCES users(id) ON DELETE RESTRICT;

ALTER TABLE rooms ADD CONSTRAINT fk_rooms_admin 
    FOREIGN KEY ("adminId") REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE rooms ADD CONSTRAINT fk_rooms_community 
    FOREIGN KEY ("communityId") REFERENCES communities(id) ON DELETE SET NULL;

ALTER TABLE messages ADD CONSTRAINT fk_messages_room 
    FOREIGN KEY ("roomId") REFERENCES rooms(id) ON DELETE CASCADE;

ALTER TABLE messages ADD CONSTRAINT fk_messages_sender 
    FOREIGN KEY ("senderId") REFERENCES users(id) ON DELETE RESTRICT;

ALTER TABLE user_rooms ADD CONSTRAINT fk_user_rooms_user 
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_rooms ADD CONSTRAINT fk_user_rooms_room 
    FOREIGN KEY ("roomId") REFERENCES rooms(id) ON DELETE CASCADE;

ALTER TABLE user_post_likes ADD CONSTRAINT fk_user_post_likes_user 
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_post_likes ADD CONSTRAINT fk_user_post_likes_post 
    FOREIGN KEY ("postId") REFERENCES posts(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_community ON users("communityId");
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories("isActive");
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_category_status ON posts("categoryId", status);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts("authorId");
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts("publishedAt");
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_messages_room ON messages("roomId");
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages("senderId");

-- Create full-text search indexes
CREATE INDEX IF NOT EXISTS idx_posts_search ON posts USING GIN(
    to_tsvector('english', title || ' ' || content || ' ' || excerpt || ' ' || COALESCE(array_to_string(tags, ' '), ''))
);

-- Insert some sample data (optional)
-- You can uncomment these if you want some initial data

-- INSERT INTO users (email, name, password, role) VALUES 
-- ('admin@example.com', 'Admin User', '$2b$12$hash_here', 'admin'),
-- ('user@example.com', 'Regular User', '$2b$12$hash_here', 'member')
-- ON CONFLICT (email) DO NOTHING;

-- INSERT INTO categories (name, slug, description, "createdById") VALUES 
-- ('Technology', 'technology', 'Technology related posts', (SELECT id FROM users WHERE email = 'admin@example.com' LIMIT 1)),
-- ('Programming', 'programming', 'Programming tutorials and tips', (SELECT id FROM users WHERE email = 'admin@example.com' LIMIT 1))
-- ON CONFLICT (name) DO NOTHING;
