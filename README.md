# Muhammed Tarik Ucar - Kişisel Blog Sitesi

Modern, responsive ve tam özellikli kişisel blog sitesi. React, Node.js, MongoDB ve Docker ile geliştirilmiştir.

## 🚀 Özellikler

### Blog Özellikleri
- ✅ Modern ve responsive tasarım
- ✅ Blog yazıları yönetimi (CRUD)
- ✅ Kategori ve etiket sistemi
- ✅ Arama ve filtreleme
- ✅ Yorum sistemi (onay gerektiren)
- ✅ Beğeni sistemi
- ✅ Öne çıkan yazılar
- ✅ SEO optimizasyonu
- ✅ Sosyal medya paylaşımı

### Analytics ve İzleme
- ✅ Ziyaretçi istatistikleri
- ✅ Sayfa görüntüleme takibi
- ✅ Popüler içerik analizi
- ✅ Gerçek zamanlı analytics
- ✅ Coğrafi analiz

### Newsletter Sistemi
- ✅ E-posta abonelik sistemi
- ✅ Kampanya yönetimi
- ✅ Abone istatistikleri
- ✅ E-posta şablonları

### Teknik Özellikler
- ✅ JWT tabanlı kimlik doğrulama
- ✅ Role-based yetkilendirme
- ✅ Rate limiting
- ✅ File upload sistemi
- ✅ Caching (Redis)
- ✅ Logging sistemi
- ✅ Error handling
- ✅ API documentation (Swagger)
- ✅ Docker containerization
- ✅ Health checks

## 🛠️ Teknoloji Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Material Tailwind** - UI components
- **Redux Toolkit** - State management
- **React Query** - Data fetching
- **Framer Motion** - Animations
- **React Router** - Routing

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Redis** - Caching
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **Winston** - Logging
- **Joi** - Validation

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy
- **Make** - Build automation

## 📦 Kurulum

### Gereksinimler
- Docker ve Docker Compose
- Node.js 18+ (local development için)
- Git

### Hızlı Başlangıç

1. **Development ortamını başlatın:**
```bash
make dev
```

2. **Production ortamını başlatın:**
```bash
make prod
```

### URL'ler

- **Frontend:** http://localhost (production) / http://localhost:3000 (development)
- **Backend API:** http://localhost:5000/api
- **MongoDB:** localhost:27017
- **Redis:** localhost:6379

### Default Admin Kullanıcısı

```
Email: admin@yourblog.com
Password: admin123456
```

## 🔧 Kullanım

### Make Komutları

```bash
# Development ortamı
make dev              # Development modunda başlat

# Production ortamı
make prod             # Production modunda başlat

# Servis yönetimi
make up               # Servisleri başlat
make down             # Servisleri durdur
make logs             # Logları görüntüle

# Temizlik
make clean            # Containers ve volumes temizle
```

## 📁 Proje Yapısı

The project is divided into two main parts:

- **Client**: React frontend application
- **Server**: Node.js/Express backend API

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/muhammedtarikucar.git
cd muhammedtarikucar
```

2. Install dependencies for both client and server:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Set up environment variables:
```bash
# In the server directory
cp .env.example .env
# Edit .env file with your configuration
```

4. Start the development servers:
```bash
# Start server in development mode
cd server
npm run dev

# Start client in development mode
cd ../client
npm run dev
```

## API Documentation

The API documentation is available at `/api-docs` when the server is running.

## Features

- User authentication with JWT
- Blog posts and events management
- User profiles
- Community features

## Technologies Used

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT for authentication
- Winston for logging
- Jest for testing
- Swagger for API documentation

### Frontend
- React
- Redux for state management
- React Router for routing
- Material Tailwind for UI components
- Framer Motion for animations
- React Query for data fetching

## Deployment

The application can be deployed using Docker:

```bash
docker build -t muhammedtarikucar .
docker run -p 5000:5000 muhammedtarikucar
```

## Testing

```bash
# Run server tests
cd server
npm test

# Run client tests
cd ../client
npm test
```

## License

This project is licensed under the ISC License.

## Contact

Muhammed Tarik Ucar - [website](https://muhammedtarikucar.com)
