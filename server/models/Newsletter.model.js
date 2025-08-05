const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Newsletter subscriber model
const Subscriber = sequelize.define('Subscriber', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        },
        set(value) {
            this.setDataValue('email', value.toLowerCase().trim());
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
        set(value) {
            if (value) this.setDataValue('name', value.trim());
        }
    },
    status: {
        type: DataTypes.ENUM('active', 'unsubscribed', 'bounced'),
        defaultValue: 'active'
    },
    subscriptionDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    unsubscribeDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    unsubscribeReason: {
        type: DataTypes.STRING,
        allowNull: true
    },
    preferences: {
        type: DataTypes.JSONB,
        defaultValue: {
            frequency: 'weekly',
            categories: []
        }
    },
    source: {
        type: DataTypes.ENUM('website', 'blog-post', 'social-media', 'referral'),
        defaultValue: 'website'
    },
    confirmationToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isConfirmed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    confirmedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    lastEmailSent: {
        type: DataTypes.DATE,
        allowNull: true
    },
    emailsSent: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    emailsOpened: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    linksClicked: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'newsletter_subscribers',
    timestamps: true,
    indexes: [
        { fields: ['email'], unique: true },
        { fields: ['status'] },
        { fields: ['subscriptionDate'] }
    ]
});

// Newsletter campaign model
const Campaign = sequelize.define('Campaign', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value) {
            this.setDataValue('title', value.trim());
        }
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value) {
            this.setDataValue('subject', value.trim());
        }
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    htmlContent: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('draft', 'scheduled', 'sending', 'sent', 'cancelled'),
        defaultValue: 'draft'
    },
    scheduledAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    sentAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    recipients: {
        type: DataTypes.JSONB,
        defaultValue: {
            total: 0,
            sent: 0,
            delivered: 0,
            opened: 0,
            clicked: 0,
            bounced: 0,
            unsubscribed: 0
        }
    },
    targetAudience: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    template: {
        type: DataTypes.ENUM('basic', 'newsletter', 'announcement', 'custom'),
        defaultValue: 'basic'
    },
    authorId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'newsletter_campaigns',
    timestamps: true,
    indexes: [
        { fields: ['status'] },
        { fields: ['scheduledAt'] },
        { fields: ['sentAt'] }
    ]
});

// Hooks
Subscriber.beforeUpdate(async (subscriber, options) => {
    if (subscriber.changed('status') && subscriber.status === 'unsubscribed' && !subscriber.unsubscribeDate) {
        subscriber.unsubscribeDate = new Date();
    }
});

// Instance methods
Subscriber.prototype.unsubscribe = async function(reason) {
    this.status = 'unsubscribed';
    this.unsubscribeDate = new Date();
    this.unsubscribeReason = reason;
    return await this.save();
};

Subscriber.prototype.confirm = async function() {
    this.isConfirmed = true;
    this.confirmedAt = new Date();
    this.confirmationToken = null;
    return await this.save();
};

// Class methods
Subscriber.getActiveSubscribers = async function(categories = []) {
    const { Op } = require('sequelize');
    const whereClause = { status: 'active', isConfirmed: true };

    if (categories.length > 0) {
        whereClause['preferences.categories'] = { [Op.overlap]: categories };
    }

    return await this.findAll({ where: whereClause });
};

Campaign.getRecentCampaigns = async function(limit = 10) {
    const User = require('./User.model');
    return await this.findAll({
        where: { status: 'sent' },
        include: [{
            model: User,
            as: 'author',
            attributes: ['name', 'email']
        }],
        order: [['sentAt', 'DESC']],
        limit
    });
};

module.exports = {
    Subscriber,
    Campaign
};
