const mongoose = require('mongoose');
const { Schema } = mongoose;

// Newsletter subscriber schema
const subscriberSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },
    name: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: ['active', 'unsubscribed', 'bounced'],
        default: 'active',
    },
    subscriptionDate: {
        type: Date,
        default: Date.now,
    },
    unsubscribeDate: Date,
    unsubscribeReason: String,
    preferences: {
        frequency: {
            type: String,
            enum: ['daily', 'weekly', 'monthly'],
            default: 'weekly',
        },
        categories: [{
            type: String,
            enum: ['technology', 'programming', 'web-development', 'mobile', 'ai', 'career', 'personal', 'tutorial'],
        }],
    },
    source: {
        type: String,
        enum: ['website', 'blog-post', 'social-media', 'referral'],
        default: 'website',
    },
    confirmationToken: String,
    isConfirmed: {
        type: Boolean,
        default: false,
    },
    confirmedAt: Date,
    lastEmailSent: Date,
    emailsSent: {
        type: Number,
        default: 0,
    },
    emailsOpened: {
        type: Number,
        default: 0,
    },
    linksClicked: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

// Newsletter campaign schema
const campaignSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    subject: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
        required: true,
    },
    htmlContent: String,
    status: {
        type: String,
        enum: ['draft', 'scheduled', 'sending', 'sent', 'cancelled'],
        default: 'draft',
    },
    scheduledAt: Date,
    sentAt: Date,
    recipients: {
        total: { type: Number, default: 0 },
        sent: { type: Number, default: 0 },
        delivered: { type: Number, default: 0 },
        opened: { type: Number, default: 0 },
        clicked: { type: Number, default: 0 },
        bounced: { type: Number, default: 0 },
        unsubscribed: { type: Number, default: 0 },
    },
    targetAudience: {
        categories: [String],
        status: [String],
        subscriptionDateRange: {
            start: Date,
            end: Date,
        },
    },
    template: {
        type: String,
        enum: ['basic', 'newsletter', 'announcement', 'custom'],
        default: 'basic',
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});

// Email tracking schema
const emailTrackingSchema = new Schema({
    campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign',
        required: true,
    },
    subscriberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscriber',
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    events: [{
        type: {
            type: String,
            enum: ['sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed'],
            required: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
        data: {
            link: String,
            userAgent: String,
            ip: String,
            reason: String,
        },
    }],
}, {
    timestamps: true,
});

// Add indexes
subscriberSchema.index({ email: 1 });
subscriberSchema.index({ status: 1 });
subscriberSchema.index({ subscriptionDate: -1 });
subscriberSchema.index({ 'preferences.categories': 1 });

campaignSchema.index({ status: 1 });
campaignSchema.index({ scheduledAt: 1 });
campaignSchema.index({ sentAt: -1 });

emailTrackingSchema.index({ campaignId: 1, subscriberId: 1 });
emailTrackingSchema.index({ 'events.type': 1, 'events.timestamp': -1 });

// Pre-save middleware
subscriberSchema.pre('save', function(next) {
    if (this.isModified('status') && this.status === 'unsubscribed' && !this.unsubscribeDate) {
        this.unsubscribeDate = new Date();
    }
    next();
});

// Methods
subscriberSchema.methods.unsubscribe = function(reason) {
    this.status = 'unsubscribed';
    this.unsubscribeDate = new Date();
    this.unsubscribeReason = reason;
    return this.save();
};

subscriberSchema.methods.confirm = function() {
    this.isConfirmed = true;
    this.confirmedAt = new Date();
    this.confirmationToken = undefined;
    return this.save();
};

// Static methods
subscriberSchema.statics.getActiveSubscribers = function(categories = []) {
    const query = { status: 'active', isConfirmed: true };
    if (categories.length > 0) {
        query['preferences.categories'] = { $in: categories };
    }
    return this.find(query);
};

campaignSchema.statics.getRecentCampaigns = function(limit = 10) {
    return this.find({ status: 'sent' })
        .sort({ sentAt: -1 })
        .limit(limit)
        .populate('author', 'name email');
};

module.exports = {
    Subscriber: mongoose.model('Subscriber', subscriberSchema),
    Campaign: mongoose.model('Campaign', campaignSchema),
    EmailTracking: mongoose.model('EmailTracking', emailTrackingSchema),
};
