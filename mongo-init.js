// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Switch to the blog database
db = db.getSiblingDB('blog_db');

// Drop existing collections if they exist to reset validation
try {
  db.users.drop();
  print('Dropped existing users collection');
} catch (e) {
  print('Users collection did not exist');
}

try {
  db.posts.drop();
  print('Dropped existing posts collection');
} catch (e) {
  print('Posts collection did not exist');
}

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'email', 'password'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
          description: 'must be a valid email and is required'
        },
        password: {
          bsonType: 'string',
          minLength: 6,
          description: 'must be a string with minimum 6 characters and is required'
        },
        role: {
          bsonType: 'string',
          enum: ['member', 'admin'],
          description: 'must be either member or admin'
        },
        isActive: {
          bsonType: 'bool',
          description: 'must be a boolean'
        },
        gender: {
          bsonType: 'string',
          enum: ['male', 'female', 'not selected'],
          description: 'must be male, female, or not selected'
        }
      }
    }
  }
});

db.createCollection('posts', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'content', 'author', 'slug'],
      properties: {
        title: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        slug: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        content: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        status: {
          bsonType: 'string',
          enum: ['draft', 'published', 'archived'],
          description: 'must be draft, published, or archived'
        },
        category: {
          bsonType: 'string',
          enum: ['technology', 'programming', 'web-development', 'mobile', 'ai', 'career', 'personal', 'tutorial'],
          description: 'must be a valid category'
        }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });

db.posts.createIndex({ slug: 1 }, { unique: true });
db.posts.createIndex({ status: 1, publishedAt: -1 });
db.posts.createIndex({ category: 1, status: 1 });
db.posts.createIndex({ tags: 1 });
db.posts.createIndex({ views: -1 });
db.posts.createIndex({ featured: 1, status: 1 });
db.posts.createIndex({ author: 1 });

// Create admin user
const adminPassword = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uIoO'; // admin123456

db.users.insertOne({
  name: 'Admin User',
  email: 'admin@yourblog.com',
  password: adminPassword,
  role: 'admin',
  image: '/default-avatar.png',
  bio: 'Blog administrator',
  isActive: true,
  gender: 'not selected',
  createdAt: new Date(),
  updatedAt: new Date()
});

// Create sample blog posts
const adminUser = db.users.findOne({ email: 'admin@yourblog.com' });

const samplePosts = [
  {
    title: 'Blog Sitemize Hoş Geldiniz',
    slug: 'blog-sitemize-hos-geldiniz',
    content: `
      <h2>Merhaba ve Hoş Geldiniz!</h2>
      <p>Bu blog sitesinde teknoloji, programlama ve kişisel deneyimlerimi paylaşacağım. Amacım, öğrendiklerimi sizlerle paylaşmak ve birlikte öğrenmeye devam etmek.</p>
      
      <h3>Neler Bulacaksınız?</h3>
      <ul>
        <li>Web geliştirme teknikleri ve ipuçları</li>
        <li>Programlama dilleri ve framework'ler hakkında yazılar</li>
        <li>Teknoloji trendleri ve yenilikler</li>
        <li>Kişisel projeler ve deneyimler</li>
        <li>Kariyer tavsiyeleri</li>
      </ul>
      
      <p>Düzenli olarak yeni içerikler paylaşacağım. Bültenime abone olarak yeni yazılardan haberdar olabilirsiniz.</p>
    `,
    excerpt: 'Blog sitemize hoş geldiniz! Bu platformda teknoloji, programlama ve kişisel deneyimlerimi paylaşacağım.',
    category: 'personal',
    tags: ['hoş geldiniz', 'blog', 'teknoloji'],
    status: 'published',
    featured: true,
    author: adminUser._id,
    publishedAt: new Date(),
    readingTime: 2,
    views: 0,
    likes: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Modern Web Geliştirme Teknolojileri',
    slug: 'modern-web-gelistirme-teknolojileri',
    content: `
      <h2>Modern Web Geliştirme Dünyası</h2>
      <p>Web geliştirme dünyası sürekli gelişiyor ve yeni teknolojiler ortaya çıkıyor. Bu yazıda 2024 yılında öne çıkan web geliştirme teknolojilerini inceleyeceğiz.</p>
      
      <h3>Frontend Teknolojileri</h3>
      <ul>
        <li><strong>React:</strong> Bileşen tabanlı kullanıcı arayüzü geliştirme</li>
        <li><strong>Vue.js:</strong> Öğrenmesi kolay, güçlü framework</li>
        <li><strong>Svelte:</strong> Derleme zamanında optimize edilen framework</li>
      </ul>
      
      <h3>Backend Teknolojileri</h3>
      <ul>
        <li><strong>Node.js:</strong> JavaScript ile server-side geliştirme</li>
        <li><strong>Python:</strong> Django ve FastAPI ile hızlı geliştirme</li>
        <li><strong>Go:</strong> Yüksek performanslı web servisleri</li>
      </ul>
      
      <p>Bu teknolojilerin her birinin kendine özgü avantajları var. Proje ihtiyaçlarınıza göre en uygun olanı seçmek önemli.</p>
    `,
    excerpt: 'Modern web geliştirme teknolojilerini ve 2024 yılında öne çıkan framework\'leri keşfedin.',
    category: 'web-development',
    tags: ['web development', 'react', 'nodejs', 'frontend', 'backend'],
    status: 'published',
    featured: false,
    author: adminUser._id,
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    readingTime: 5,
    views: 0,
    likes: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

db.posts.insertMany(samplePosts);

print('Database initialized successfully with sample data!');
