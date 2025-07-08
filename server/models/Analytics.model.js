const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Daily analytics model
const DailyAnalytics = sequelize.define('DailyAnalytics', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        unique: true
    },
    pageViews: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    uniqueVisitors: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    sessions: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    bounceRate: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    avgSessionDuration: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    topPages: {
        type: DataTypes.JSONB,
        defaultValue: []
    },
    topReferrers: {
        type: DataTypes.JSONB,
        defaultValue: []
    },
    deviceTypes: {
        type: DataTypes.JSONB,
        defaultValue: { desktop: 0, mobile: 0, tablet: 0 }
    },
    browsers: {
        type: DataTypes.JSONB,
        defaultValue: []
    },
    countries: {
        type: DataTypes.JSONB,
        defaultValue: []
    }
}, {
    tableName: 'daily_analytics',
    timestamps: true
});

// Visitor session model
const VisitorSession = sequelize.define('VisitorSession', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    sessionId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    ip: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userAgent: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    country: {
        type: DataTypes.STRING,
        allowNull: true
    },
    city: {
        type: DataTypes.STRING,
        allowNull: true
    },
    referrer: {
        type: DataTypes.STRING,
        allowNull: true
    },
    entryPage: {
        type: DataTypes.STRING,
        allowNull: true
    },
    exitPage: {
        type: DataTypes.STRING,
        allowNull: true
    },
    pageViews: {
        type: DataTypes.JSONB,
        defaultValue: []
    },
    startTime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    endTime: {
        type: DataTypes.DATE,
        allowNull: true
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    isBot: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'visitor_sessions',
    timestamps: true,
    indexes: [
        { fields: ['sessionId'], unique: true },
        { fields: ['ip', 'startTime'] },
        { fields: ['startTime'] }
    ]
});

// Basic class methods
DailyAnalytics.getDateRange = async function(startDate, endDate) {
    return await this.findAll({
        where: {
            date: {
                [sequelize.Sequelize.Op.between]: [startDate, endDate]
            }
        },
        order: [['date', 'DESC']]
    });
};

VisitorSession.getActiveUsers = async function() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return await this.count({
        where: {
            startTime: { [sequelize.Sequelize.Op.gte]: oneHourAgo },
            endTime: null
        }
    });
};

module.exports = {
    DailyAnalytics,
    VisitorSession
};
