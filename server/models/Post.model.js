const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const blogPostSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        content: {
            type: String,
            required: true,
        },
        excerpt: {
            type: String,
            required: true,
            maxlength: 300,
        },
        featuredImage: {
            type: String,
            default: null,
        },
        images: [{
            url: String,
            alt: String,
            caption: String,
        }],
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
        },
        tags: [{
            type: String,
            lowercase: true,
            trim: true,
        }],
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ['draft', 'published', 'archived'],
            default: 'draft',
        },
        publishedAt: {
            type: Date,
            default: null,
        },
        views: {
            type: Number,
            default: 0,
        },
        viewHistory: [{
            ip: {
                type: String,
                required: true,
            },
            userAgent: String,
            referrer: String,
            country: String,
            city: String,
            viewedAt: {
                type: Date,
                default: Date.now,
            }
        }],
        readingTime: {
            type: Number, // in minutes
            default: 1,
        },
        seo: {
            metaTitle: {
                type: String,
                maxlength: 60,
            },
            metaDescription: {
                type: String,
                maxlength: 160,
            },
            keywords: [String],
            ogImage: String,
            ogTitle: String,
            ogDescription: String,
        },
        comments: [
            {
                name: {
                    type: String,
                    required: true,
                    trim: true,
                },
                email: {
                    type: String,
                    required: true,
                    lowercase: true,
                },
                website: String,
                text: {
                    type: String,
                    required: true,
                },
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    default: null,
                },
                isApproved: {
                    type: Boolean,
                    default: false,
                },
                parentComment: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Post.comments',
                    default: null,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        likes: {
            type: Number,
            default: 0,
        },
        featured: {
            type: Boolean,
            default: false,
        },
        relatedPosts: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
        }],
    },
    {
        timestamps: true,
    }
);

// Add indexes for better performance
blogPostSchema.index({ slug: 1 });
blogPostSchema.index({ category: 1, status: 1 });
blogPostSchema.index({ tags: 1 });
blogPostSchema.index({ publishedAt: -1 });
blogPostSchema.index({ views: -1 });
blogPostSchema.index({ featured: 1, status: 1 });

// Text search indexes
blogPostSchema.index({
    title: 'text',
    content: 'text',
    excerpt: 'text',
    tags: 'text'
}, {
    weights: {
        title: 10,
        excerpt: 5,
        tags: 3,
        content: 1
    },
    name: 'post_text_index'
});

// Pre-save middleware to generate slug and calculate reading time
blogPostSchema.pre('save', function(next) {
    if (this.isModified('title') && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
    }

    if (this.isModified('content')) {
        // Calculate reading time (average 200 words per minute)
        const wordCount = this.content.split(/\s+/).length;
        this.readingTime = Math.ceil(wordCount / 200);
    }

    if (this.status === 'published' && !this.publishedAt) {
        this.publishedAt = new Date();
    }

    next();
});

// Virtual for URL
blogPostSchema.virtual('url').get(function() {
    return `/blog/${this.slug}`;
});

// Method to increment views
blogPostSchema.methods.incrementViews = function(viewData) {
    this.views += 1;
    this.viewHistory.push(viewData);
    return this.save();
};

// Static method to get popular posts
blogPostSchema.statics.getPopularPosts = function(limit = 5) {
    return this.find({ status: 'published' })
        .populate('author', 'name image role')
        .sort({ views: -1 })
        .limit(limit);
};

// Static method to get recent posts
blogPostSchema.statics.getRecentPosts = function(limit = 5) {
    return this.find({ status: 'published' })
        .populate('author', 'name image role')
        .sort({ publishedAt: -1 })
        .limit(limit);
};

// Static method to get featured posts
blogPostSchema.statics.getFeaturedPosts = function(limit = 3) {
    return this.find({ status: 'published', featured: true })
        .populate('author', 'name image role')
        .sort({ publishedAt: -1 })
        .limit(limit);
};

module.exports = mongoose.model("Post", blogPostSchema);
