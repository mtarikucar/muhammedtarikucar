const { Subscriber, Campaign, EmailTracking } = require('../models/Newsletter.model');
const { AppError } = require('../middlewares/errorHandler');
const { logger } = require('../utils/logger');
const crypto = require('crypto');

// Subscribe to newsletter
async function subscribe(req, res, next) {
  try {
    const { email, name, preferences } = req.body;

    if (!email) {
      return next(AppError.validation('Email is required'));
    }

    // Check if already subscribed
    const existingSubscriber = await Subscriber.findOne({ email: email.toLowerCase() });
    
    if (existingSubscriber) {
      if (existingSubscriber.status === 'active') {
        return res.json({
          status: 'success',
          message: 'You are already subscribed to our newsletter'
        });
      } else {
        // Reactivate subscription
        existingSubscriber.status = 'active';
        existingSubscriber.subscriptionDate = new Date();
        existingSubscriber.unsubscribeDate = undefined;
        existingSubscriber.unsubscribeReason = undefined;
        await existingSubscriber.save();
        
        return res.json({
          status: 'success',
          message: 'Your subscription has been reactivated'
        });
      }
    }

    // Create new subscriber
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    
    const subscriber = new Subscriber({
      email: email.toLowerCase(),
      name: name || '',
      preferences: preferences || {},
      confirmationToken,
      source: 'website'
    });

    await subscriber.save();

    // TODO: Send confirmation email
    logger.info(`New newsletter subscription: ${email}`);

    res.status(201).json({
      status: 'success',
      message: 'Thank you for subscribing! Please check your email to confirm your subscription.'
    });
  } catch (error) {
    logger.error('Newsletter subscribe error:', error);
    next(error);
  }
}

// Confirm subscription
async function confirmSubscription(req, res, next) {
  try {
    const { token } = req.params;

    const subscriber = await Subscriber.findOne({ confirmationToken: token });
    
    if (!subscriber) {
      return next(AppError.notFound('Invalid confirmation token'));
    }

    await subscriber.confirm();

    logger.info(`Newsletter subscription confirmed: ${subscriber.email}`);

    res.json({
      status: 'success',
      message: 'Your subscription has been confirmed successfully!'
    });
  } catch (error) {
    logger.error('Confirm subscription error:', error);
    next(error);
  }
}

// Unsubscribe from newsletter
async function unsubscribe(req, res, next) {
  try {
    const { email, reason } = req.body;

    if (!email) {
      return next(AppError.validation('Email is required'));
    }

    const subscriber = await Subscriber.findOne({ email: email.toLowerCase() });
    
    if (!subscriber) {
      return next(AppError.notFound('Email not found in our subscription list'));
    }

    await subscriber.unsubscribe(reason || 'User requested');

    logger.info(`Newsletter unsubscription: ${email}`);

    res.json({
      status: 'success',
      message: 'You have been successfully unsubscribed from our newsletter'
    });
  } catch (error) {
    logger.error('Newsletter unsubscribe error:', error);
    next(error);
  }
}

// Get all subscribers (admin only)
async function getSubscribers(req, res, next) {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status = 'active',
      search 
    } = req.query;

    const query = { status };
    
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    const subscribers = await Subscriber.find(query)
      .sort({ subscriptionDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Subscriber.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        subscribers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalSubscribers: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    logger.error('Get subscribers error:', error);
    next(error);
  }
}

// Get subscriber statistics (admin only)
async function getSubscriberStats(req, res, next) {
  try {
    const totalSubscribers = await Subscriber.countDocuments({ status: 'active' });
    const totalUnsubscribed = await Subscriber.countDocuments({ status: 'unsubscribed' });
    const totalBounced = await Subscriber.countDocuments({ status: 'bounced' });
    
    // Get subscription growth over time (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const growthData = await Subscriber.aggregate([
      {
        $match: {
          subscriptionDate: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$subscriptionDate' },
            month: { $month: '$subscriptionDate' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Get category preferences
    const categoryStats = await Subscriber.aggregate([
      { $match: { status: 'active' } },
      { $unwind: '$preferences.categories' },
      { $group: { _id: '$preferences.categories', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      status: 'success',
      data: {
        totalSubscribers,
        totalUnsubscribed,
        totalBounced,
        growthData,
        categoryStats
      }
    });
  } catch (error) {
    logger.error('Get subscriber stats error:', error);
    next(error);
  }
}

// Create campaign (admin only)
async function createCampaign(req, res, next) {
  try {
    const {
      title,
      subject,
      content,
      htmlContent,
      scheduledAt,
      targetAudience,
      template
    } = req.body;

    if (!title || !subject || !content) {
      return next(AppError.validation('Title, subject, and content are required'));
    }

    const campaign = new Campaign({
      title,
      subject,
      content,
      htmlContent,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      targetAudience: targetAudience || {},
      template: template || 'basic',
      author: req.user.id
    });

    await campaign.save();

    logger.info(`New newsletter campaign created: ${title} by ${req.user.name}`);

    res.status(201).json({
      status: 'success',
      message: 'Campaign created successfully',
      data: { campaign }
    });
  } catch (error) {
    logger.error('Create campaign error:', error);
    next(error);
  }
}

// Get campaigns (admin only)
async function getCampaigns(req, res, next) {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const campaigns = await Campaign.find(query)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Campaign.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        campaigns,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalCampaigns: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    logger.error('Get campaigns error:', error);
    next(error);
  }
}

// Send campaign (admin only)
async function sendCampaign(req, res, next) {
  try {
    const { id } = req.params;

    const campaign = await Campaign.findById(id);
    
    if (!campaign) {
      return next(AppError.notFound('Campaign not found'));
    }

    if (campaign.status !== 'draft') {
      return next(AppError.validation('Only draft campaigns can be sent'));
    }

    // Get target subscribers
    const subscribers = await Subscriber.getActiveSubscribers(
      campaign.targetAudience.categories || []
    );

    campaign.status = 'sending';
    campaign.recipients.total = subscribers.length;
    await campaign.save();

    // TODO: Implement actual email sending logic here
    // For now, we'll just mark it as sent
    campaign.status = 'sent';
    campaign.sentAt = new Date();
    campaign.recipients.sent = subscribers.length;
    campaign.recipients.delivered = subscribers.length;
    await campaign.save();

    logger.info(`Campaign sent: ${campaign.title} to ${subscribers.length} subscribers`);

    res.json({
      status: 'success',
      message: `Campaign sent successfully to ${subscribers.length} subscribers`
    });
  } catch (error) {
    logger.error('Send campaign error:', error);
    next(error);
  }
}

module.exports = {
  subscribe,
  confirmSubscription,
  unsubscribe,
  getSubscribers,
  getSubscriberStats,
  createCampaign,
  getCampaigns,
  sendCampaign
};
