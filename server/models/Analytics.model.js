const mongoose = require('mongoose');
const { Schema } = mongoose;

// Daily analytics schema
const dailyAnalyticsSchema = new Schema({
    date: {
        type: Date,
        required: true,
        unique: true,
    },
    pageViews: {
        type: Number,
        default: 0,
    },
    uniqueVisitors: {
        type: Number,
        default: 0,
    },
    sessions: {
        type: Number,
        default: 0,
    },
    bounceRate: {
        type: Number,
        default: 0,
    },
    avgSessionDuration: {
        type: Number,
        default: 0,
    },
    topPages: [{
        path: String,
        views: Number,
    }],
    topReferrers: [{
        source: String,
        visits: Number,
    }],
    deviceTypes: {
        desktop: { type: Number, default: 0 },
        mobile: { type: Number, default: 0 },
        tablet: { type: Number, default: 0 },
    },
    browsers: [{
        name: String,
        count: Number,
    }],
    countries: [{
        name: String,
        count: Number,
    }],
}, {
    timestamps: true,
});

// Visitor session schema
const visitorSessionSchema = new Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true,
    },
    ip: {
        type: String,
        required: true,
    },
    userAgent: String,
    country: String,
    city: String,
    referrer: String,
    entryPage: String,
    exitPage: String,
    pageViews: [{
        path: String,
        timestamp: Date,
        timeSpent: Number, // in seconds
    }],
    startTime: {
        type: Date,
        default: Date.now,
    },
    endTime: Date,
    duration: Number, // in seconds
    isBot: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

// Real-time analytics schema
const realtimeAnalyticsSchema = new Schema({
    timestamp: {
        type: Date,
        default: Date.now,
        expires: 3600, // Expire after 1 hour
    },
    activeUsers: {
        type: Number,
        default: 0,
    },
    currentPageViews: [{
        path: String,
        count: Number,
    }],
    recentEvents: [{
        type: String,
        path: String,
        timestamp: Date,
        country: String,
    }],
});

// Page performance schema
const pagePerformanceSchema = new Schema({
    path: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    views: {
        type: Number,
        default: 0,
    },
    uniqueViews: {
        type: Number,
        default: 0,
    },
    avgTimeOnPage: {
        type: Number,
        default: 0,
    },
    bounceRate: {
        type: Number,
        default: 0,
    },
    exitRate: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

// Add indexes
dailyAnalyticsSchema.index({ date: -1 });
visitorSessionSchema.index({ sessionId: 1 });
visitorSessionSchema.index({ ip: 1, startTime: -1 });
visitorSessionSchema.index({ startTime: -1 });
realtimeAnalyticsSchema.index({ timestamp: -1 });
pagePerformanceSchema.index({ path: 1, date: -1 });

// Static methods for analytics
dailyAnalyticsSchema.statics.getDateRange = function(startDate, endDate) {
    return this.find({
        date: {
            $gte: startDate,
            $lte: endDate,
        }
    }).sort({ date: -1 });
};

visitorSessionSchema.statics.getActiveUsers = function() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return this.countDocuments({
        startTime: { $gte: oneHourAgo },
        endTime: { $exists: false },
    });
};

module.exports = {
    DailyAnalytics: mongoose.model('DailyAnalytics', dailyAnalyticsSchema),
    VisitorSession: mongoose.model('VisitorSession', visitorSessionSchema),
    RealtimeAnalytics: mongoose.model('RealtimeAnalytics', realtimeAnalyticsSchema),
    PagePerformance: mongoose.model('PagePerformance', pagePerformanceSchema),
};
