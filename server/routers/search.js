/**
 * Search routes
 * Handles search functionality across posts, users, and categories
 */
const express = require('express');
const router = express.Router();
const Post = require('../models/Post.model');
const User = require('../models/User.model');
const Category = require('../models/Category.model');
const { logger } = require('../utils/logger');

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Search across posts, users, and categories
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [posts, users, categories, all]
 *         description: Type of content to search
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *         description: Number of results per type
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     posts:
 *                       type: array
 *                     users:
 *                       type: array
 *                     categories:
 *                       type: array
 *                     query:
 *                       type: string
 *                     totalResults:
 *                       type: integer
 *       400:
 *         description: Bad request - missing query parameter
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res) => {
  try {
    const { q: query, type = 'all', limit = 10 } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchLimit = Math.min(parseInt(limit) || 10, 50);
    const searchRegex = new RegExp(query.trim(), 'i');
    
    const results = {
      posts: [],
      users: [],
      categories: [],
      query: query.trim(),
      totalResults: 0
    };

    // Search posts
    if (type === 'all' || type === 'posts') {
      try {
        const posts = await Post.find({
          $or: [
            { title: searchRegex },
            { content: searchRegex },
            { tags: { $in: [searchRegex] } },
            { excerpt: searchRegex }
          ],
          status: 'published'
        })
        .populate('author', 'name email')
        .select('title excerpt content tags createdAt updatedAt views likes author category slug')
        .sort({ createdAt: -1 })
        .limit(searchLimit);

        results.posts = posts;
      } catch (error) {
        logger.error('Error searching posts:', error);
      }
    }

    // Search users (only public profiles)
    if (type === 'all' || type === 'users') {
      try {
        const users = await User.find({
          $or: [
            { name: searchRegex },
            { email: searchRegex }
          ],
          isActive: true
        })
        .select('name email image createdAt')
        .limit(searchLimit);

        results.users = users;
      } catch (error) {
        logger.error('Error searching users:', error);
      }
    }

    // Search categories
    if (type === 'all' || type === 'categories') {
      try {
        const categories = await Category.find({
          $or: [
            { name: searchRegex },
            { description: searchRegex }
          ]
        })
        .select('name description slug color icon postCount')
        .limit(searchLimit);

        results.categories = categories;
      } catch (error) {
        logger.error('Error searching categories:', error);
      }
    }

    // Calculate total results
    results.totalResults = results.posts.length + results.users.length + results.categories.length;

    logger.info(`Search performed: "${query}" - ${results.totalResults} results found`);

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    logger.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during search'
    });
  }
});

/**
 * @swagger
 * /api/search/suggestions:
 *   get:
 *     summary: Get search suggestions
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Partial search query
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *         description: Number of suggestions
 *     responses:
 *       200:
 *         description: Search suggestions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       text:
 *                         type: string
 *                       type:
 *                         type: string
 *                       count:
 *                         type: integer
 */
router.get('/suggestions', async (req, res) => {
  try {
    const { q: query, limit = 5 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    const searchLimit = Math.min(parseInt(limit) || 5, 10);
    const searchRegex = new RegExp(query.trim(), 'i');
    
    const suggestions = [];

    // Get popular tags
    const posts = await Post.find({
      tags: { $in: [searchRegex] },
      status: 'published'
    })
    .select('tags')
    .limit(searchLimit * 2);

    const tagCounts = {};
    posts.forEach(post => {
      post.tags.forEach(tag => {
        if (searchRegex.test(tag)) {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
      });
    });

    // Add tag suggestions
    Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, searchLimit)
      .forEach(([tag, count]) => {
        suggestions.push({
          text: tag,
          type: 'tag',
          count
        });
      });

    // Get category suggestions
    const categories = await Category.find({
      name: searchRegex
    })
    .select('name postCount')
    .limit(searchLimit);

    categories.forEach(category => {
      suggestions.push({
        text: category.name,
        type: 'category',
        count: category.postCount || 0
      });
    });

    res.json({
      success: true,
      data: suggestions.slice(0, searchLimit)
    });

  } catch (error) {
    logger.error('Search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
