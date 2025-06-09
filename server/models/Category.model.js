const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 50
    },
    slug: {
      type: String,
      required: false,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      maxlength: 200,
      default: ''
    },
    color: {
      type: String,
      default: '#3B82F6', // Default blue color
      match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/ // Hex color validation
    },
    icon: {
      type: String,
      default: 'folder', // Default icon name
      maxlength: 50
    },
    image: {
      type: String,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    },
    sortOrder: {
      type: Number,
      default: 0
    },
    postCount: {
      type: Number,
      default: 0
    },
    seo: {
      metaTitle: {
        type: String,
        maxlength: 60
      },
      metaDescription: {
        type: String,
        maxlength: 160
      },
      keywords: [{
        type: String,
        trim: true
      }]
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Indexes
categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ sortOrder: 1 });
categorySchema.index({ name: 'text', description: 'text' });

// Pre-save middleware to generate slug
categorySchema.pre('save', function(next) {
  if (!this.slug || this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }
  next();
});

// Static methods
categorySchema.statics.getActiveCategories = function() {
  return this.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
};

categorySchema.statics.getCategoryBySlug = function(slug) {
  return this.findOne({ slug, isActive: true });
};

categorySchema.statics.updatePostCount = async function(categoryId) {
  const Post = mongoose.model('Post');
  const count = await Post.countDocuments({ category: categoryId, status: 'published' });
  return this.findByIdAndUpdate(categoryId, { postCount: count }, { new: true });
};

// Instance methods
categorySchema.methods.incrementPostCount = function() {
  this.postCount += 1;
  return this.save();
};

categorySchema.methods.decrementPostCount = function() {
  if (this.postCount > 0) {
    this.postCount -= 1;
  }
  return this.save();
};

// Virtual for full URL
categorySchema.virtual('url').get(function() {
  return `/blog/category/${this.slug}`;
});

// Transform output
categorySchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Category', categorySchema);
