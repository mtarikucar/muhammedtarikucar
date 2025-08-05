/**
 * Seed data for testing
 * Run this script to populate the database with test data
 */
const { sequelize } = require('../config/database');
const {
  User,
  Category,
  Post,
  Community
} = require('../models');
const { ChatRoom } = require('../models/Chat.model');
const { hashPassword } = require('../utils/auth');
const { logger } = require('../utils/logger');

async function seedDatabase() {
  try {
    logger.info('Starting database seeding...');

    // Create admin user
    const adminPassword = await hashPassword('Admin123@');
    const adminUser = await User.create({
      email: 'muhammedtarikucar@gmail.com',
      name: 'Muhammed Tarik Ucar',
      password: adminPassword,
      role: 'admin',
      isActive: true,
      gender: 'not selected',
      bio: 'System administrator and owner'
    });
    logger.info('Admin user created');

    // Create test users
    const testUserPassword = await hashPassword('Test123@');
    const testUser1 = await User.create({
      email: 'test1@example.com',
      name: 'Test User 1',
      password: testUserPassword,
      role: 'member',
      isActive: true,
      gender: 'male',
      bio: 'I love blogging about technology'
    });

    const testUser2 = await User.create({
      email: 'test2@example.com',
      name: 'Test User 2',
      password: testUserPassword,
      role: 'member',
      isActive: true,
      gender: 'female',
      bio: 'Passionate about web development'
    });
    logger.info('Test users created');

    // Create categories
    const categories = await Promise.all([
      Category.create({
        name: 'Technology',
        slug: 'technology',
        description: 'Latest tech news and tutorials',
        color: '#0066cc',
        icon: 'desktop',
        createdById: adminUser.id
      }),
      Category.create({
        name: 'Programming',
        slug: 'programming',
        description: 'Programming tutorials and best practices',
        color: '#00aa00',
        icon: 'code',
        createdById: adminUser.id
      }),
      Category.create({
        name: 'Web Development',
        slug: 'web-development',
        description: 'Frontend and backend web development',
        color: '#ff6600',
        icon: 'web',
        createdById: adminUser.id
      }),
      Category.create({
        name: 'Mobile',
        slug: 'mobile',
        description: 'Mobile app development',
        color: '#9933ff',
        icon: 'mobile',
        createdById: adminUser.id
      }),
      Category.create({
        name: 'AI & Machine Learning',
        slug: 'ai-machine-learning',
        description: 'Artificial Intelligence and ML topics',
        color: '#ff3366',
        icon: 'brain',
        createdById: adminUser.id
      })
    ]);
    logger.info('Categories created');

    // Create posts
    const posts = await Promise.all([
      Post.create({
        title: 'Getting Started with React 18',
        slug: 'getting-started-with-react-18',
        content: `<h2>Introduction to React 18</h2>
<p>React 18 introduces several new features including automatic batching, transitions, and suspense on the server. In this post, we'll explore these new features and how to use them.</p>
<h3>Automatic Batching</h3>
<p>React 18 automatically batches multiple state updates into a single re-render for better performance...</p>`,
        excerpt: 'Learn about the new features in React 18 including automatic batching, transitions, and more.',
        authorId: adminUser.id,
        categoryId: categories[2].id, // Web Development
        status: 'published',
        views: 150,
        readTime: 5
      }),
      Post.create({
        title: 'Building REST APIs with Node.js',
        slug: 'building-rest-apis-with-nodejs',
        content: `<h2>Introduction</h2>
<p>Node.js is a powerful platform for building scalable REST APIs. In this tutorial, we'll build a complete REST API from scratch.</p>
<h3>Setting up Express</h3>
<p>First, let's install the necessary dependencies...</p>`,
        excerpt: 'A comprehensive guide to building RESTful APIs using Node.js, Express, and best practices.',
        authorId: testUser1.id,
        categoryId: categories[1].id, // Programming
        status: 'published',
        views: 230,
        readTime: 8
      }),
      Post.create({
        title: 'Introduction to Machine Learning',
        slug: 'introduction-to-machine-learning',
        content: `<h2>What is Machine Learning?</h2>
<p>Machine Learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.</p>
<h3>Types of Machine Learning</h3>
<p>There are three main types: Supervised Learning, Unsupervised Learning, and Reinforcement Learning...</p>`,
        excerpt: 'Get started with machine learning concepts, algorithms, and practical applications.',
        authorId: testUser2.id,
        categoryId: categories[4].id, // AI & ML
        status: 'published',
        views: 180,
        readTime: 10
      }),
      Post.create({
        title: 'Mobile App Development Trends 2025',
        slug: 'mobile-app-development-trends-2025',
        content: `<h2>The Future of Mobile Development</h2>
<p>As we move into 2025, several trends are shaping the mobile app development landscape...</p>`,
        excerpt: 'Explore the latest trends in mobile app development for 2025.',
        authorId: adminUser.id,
        categoryId: categories[3].id, // Mobile
        status: 'published',
        views: 95,
        readTime: 6
      }),
      Post.create({
        title: 'Understanding TypeScript Generics',
        slug: 'understanding-typescript-generics',
        content: `<h2>TypeScript Generics</h2>
<p>Generics provide a way to create reusable components that work with multiple types while maintaining type safety.</p>`,
        excerpt: 'Master TypeScript generics with practical examples and use cases.',
        authorId: testUser1.id,
        categoryId: categories[1].id, // Programming
        status: 'draft',
        views: 0,
        readTime: 7
      })
    ]);
    logger.info('Posts created');

    // Create a community
    const community = await Community.create({
      name: 'Tech Enthusiasts',
      slug: 'tech-enthusiasts',
      description: 'A community for technology lovers to share and discuss',
      ownerId: adminUser.id,
      isActive: true
    });

    // Add members to community
    await testUser1.update({ communityId: community.id });
    await testUser2.update({ communityId: community.id });
    logger.info('Community created');

    // Create chat rooms
    const chatRooms = await Promise.all([
      ChatRoom.create({
        name: 'General Discussion',
        description: 'General chat about anything tech-related',
        type: 'public',
        createdById: adminUser.id,
        isActive: true,
        currentUsers: 0
      }),
      ChatRoom.create({
        name: 'Programming Help',
        description: 'Get help with your programming questions',
        type: 'public',
        createdById: testUser1.id,
        isActive: true,
        currentUsers: 0
      }),
      ChatRoom.create({
        name: 'Web Dev Chat',
        description: 'Discuss web development topics',
        type: 'public',
        createdById: testUser2.id,
        isActive: true,
        currentUsers: 0
      })
    ]);
    logger.info('Chat rooms created');

    logger.info('Database seeding completed successfully!');
    logger.info(`
      Created:
      - 1 Admin user (muhammedtarikucar@gmail.com / Admin123@)
      - 2 Test users (test1@example.com, test2@example.com / Test123@)
      - 5 Categories
      - 5 Posts (4 published, 1 draft)
      - 1 Community
      - 3 Chat rooms
    `);

  } catch (error) {
    logger.error('Error seeding database:', error);
    throw error;
  }
}

// Run seed if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      logger.info('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedDatabase;