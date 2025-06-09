const { 
  DailyAnalytics, 
  VisitorSession, 
  RealtimeAnalytics, 
  PagePerformance 
} = require('../models/Analytics.model');
const Post = require('../models/Post.model');
const { AppError } = require('../middlewares/errorHandler');
const { logger } = require('../utils/logger');

// Get dashboard analytics
async function getDashboardAnalytics(req, res, next) {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get daily analytics for the period
    const dailyAnalytics = await DailyAnalytics.getDateRange(startDate, new Date());

    // Calculate totals
    const totals = dailyAnalytics.reduce((acc, day) => {
      acc.pageViews += day.pageViews;
      acc.uniqueVisitors += day.uniqueVisitors;
      acc.sessions += day.sessions;
      return acc;
    }, { pageViews: 0, uniqueVisitors: 0, sessions: 0 });

    // Get top posts
    const topPosts = await Post.find({ status: 'published' })
      .sort({ views: -1 })
      .limit(10)
      .select('title slug views publishedAt');

    // Get recent posts performance
    const recentPosts = await Post.find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .limit(5)
      .select('title slug views likes publishedAt readingTime');

    // Get category distribution
    const categoryStats = await Post.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 }, totalViews: { $sum: '$views' } } },
      { $sort: { count: -1 } }
    ]);

    // Get active users (last hour)
    const activeUsers = await VisitorSession.getActiveUsers();

    res.json({
      status: 'success',
      data: {
        period: parseInt(period),
        totals,
        dailyAnalytics,
        topPosts,
        recentPosts,
        categoryStats,
        activeUsers
      }
    });
  } catch (error) {
    logger.error('Get dashboard analytics error:', error);
    next(error);
  }
}

// Get detailed analytics for a specific period
async function getDetailedAnalytics(req, res, next) {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return next(AppError.validation('Start date and end date are required'));
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get daily analytics
    const dailyAnalytics = await DailyAnalytics.getDateRange(start, end);

    // Get page performance
    const pagePerformance = await PagePerformance.find({
      date: { $gte: start, $lte: end }
    }).sort({ views: -1 });

    // Get visitor sessions
    const visitorSessions = await VisitorSession.find({
      startTime: { $gte: start, $lte: end }
    }).sort({ startTime: -1 }).limit(100);

    res.json({
      status: 'success',
      data: {
        dailyAnalytics,
        pagePerformance,
        visitorSessions
      }
    });
  } catch (error) {
    logger.error('Get detailed analytics error:', error);
    next(error);
  }
}

// Get real-time analytics
async function getRealtimeAnalytics(req, res, next) {
  try {
    // Get latest real-time data
    const realtimeData = await RealtimeAnalytics.findOne()
      .sort({ timestamp: -1 });

    // Get active sessions (last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const activeSessions = await VisitorSession.find({
      startTime: { $gte: oneHourAgo },
      endTime: { $exists: false }
    }).sort({ startTime: -1 });

    // Get recent page views (last 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const recentViews = await VisitorSession.aggregate([
      { $match: { startTime: { $gte: thirtyMinutesAgo } } },
      { $unwind: '$pageViews' },
      { $match: { 'pageViews.timestamp': { $gte: thirtyMinutesAgo } } },
      { $group: { _id: '$pageViews.path', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      status: 'success',
      data: {
        activeUsers: activeSessions.length,
        activeSessions,
        recentViews,
        realtimeData
      }
    });
  } catch (error) {
    logger.error('Get realtime analytics error:', error);
    next(error);
  }
}

// Track page view
async function trackPageView(req, res, next) {
  try {
    const { path, referrer, userAgent } = req.body;
    const ip = req.ip;

    // Create or update visitor session
    const sessionId = req.sessionID || `${ip}-${Date.now()}`;
    
    let session = await VisitorSession.findOne({ sessionId });
    
    if (!session) {
      session = new VisitorSession({
        sessionId,
        ip,
        userAgent,
        referrer,
        entryPage: path,
        country: req.get('CF-IPCountry') || 'Unknown',
        city: req.get('CF-IPCity') || 'Unknown',
      });
    }

    // Add page view
    session.pageViews.push({
      path,
      timestamp: new Date(),
      timeSpent: 0
    });

    await session.save();

    // Update daily analytics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let dailyAnalytics = await DailyAnalytics.findOne({ date: today });
    
    if (!dailyAnalytics) {
      dailyAnalytics = new DailyAnalytics({ date: today });
    }

    dailyAnalytics.pageViews += 1;
    
    // Update top pages
    const existingPage = dailyAnalytics.topPages.find(p => p.path === path);
    if (existingPage) {
      existingPage.views += 1;
    } else {
      dailyAnalytics.topPages.push({ path, views: 1 });
    }

    // Sort and limit top pages
    dailyAnalytics.topPages.sort((a, b) => b.views - a.views);
    dailyAnalytics.topPages = dailyAnalytics.topPages.slice(0, 10);

    await dailyAnalytics.save();

    res.json({
      status: 'success',
      message: 'Page view tracked successfully'
    });
  } catch (error) {
    logger.error('Track page view error:', error);
    next(error);
  }
}

// Get post analytics
async function getPostAnalytics(req, res, next) {
  try {
    const { slug } = req.params;
    const { period = '30' } = req.query;

    const post = await Post.findOne({ slug }).select('title views viewHistory publishedAt');
    
    if (!post) {
      return next(AppError.notFound('Post not found'));
    }

    // Filter view history by period
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const viewHistory = post.viewHistory.filter(view => 
      view.viewedAt >= startDate
    );

    // Group views by date
    const dailyViews = {};
    viewHistory.forEach(view => {
      const date = view.viewedAt.toISOString().split('T')[0];
      dailyViews[date] = (dailyViews[date] || 0) + 1;
    });

    // Group views by country
    const countryViews = {};
    viewHistory.forEach(view => {
      const country = view.country || 'Unknown';
      countryViews[country] = (countryViews[country] || 0) + 1;
    });

    res.json({
      status: 'success',
      data: {
        post: {
          title: post.title,
          slug: post.slug,
          totalViews: post.views,
          publishedAt: post.publishedAt
        },
        period: parseInt(period),
        periodViews: viewHistory.length,
        dailyViews,
        countryViews
      }
    });
  } catch (error) {
    logger.error('Get post analytics error:', error);
    next(error);
  }
}

// Get simple dashboard stats
async function getSimpleDashboardStats(req, res, next) {
  try {
    const User = require('../models/User.model');

    // Get basic counts
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalPosts = await Post.countDocuments({ status: 'published' });

    // Get total views and likes
    const postStats = await Post.aggregate([
      { $match: { status: 'published' } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: '$likes' }
        }
      }
    ]);

    const stats = postStats[0] || { totalViews: 0, totalLikes: 0 };

    res.json({
      status: 'success',
      data: {
        totalUsers,
        totalPosts,
        totalViews: stats.totalViews,
        totalLikes: stats.totalLikes
      }
    });
  } catch (error) {
    logger.error('Get simple dashboard stats error:', error);
    next(error);
  }
}

module.exports = {
  getDashboardAnalytics,
  getDetailedAnalytics,
  getRealtimeAnalytics,
  trackPageView,
  getPostAnalytics,
  getSimpleDashboardStats
};
