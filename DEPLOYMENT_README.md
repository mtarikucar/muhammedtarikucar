# 🚀 muhammedtarikucar.com Modular Deployment System

Bu proje için özel olarak tasarlanmış modüler deployment sistemi. Her adım ayrı bir script olarak organize edilmiştir.

## 📋 Genel Bakış

Bu deployment sistemi aşağıdaki özellikleri sunar:

- ✅ **Modüler Yapı**: Her fonksiyon ayrı script dosyası
- ✅ **Güvenli Deployment**: Otomatik yedekleme ve rollback
- ✅ **SSL Otomasyonu**: Let's Encrypt ile otomatik SSL
- ✅ **Sağlık Kontrolleri**: Kapsamlı sistem ve uygulama kontrolleri
- ✅ **Docker Entegrasyonu**: Tam Docker Compose desteği
- ✅ **Nginx Konfigürasyonu**: Güvenlik ve performans optimizasyonları
- ✅ **İzleme Araçları**: Sistem ve servis izleme scriptleri

## 🏗️ Sistem Mimarisi

```
muhammedtarikucar.com (161.97.80.171)
├── Frontend (Port 8082) - React/Vite
├── Backend (Port 5000) - Node.js/Express
├── MongoDB (Port 27018) - Veritabanı
├── Redis (Port 6380) - Cache
└── Nginx (Port 80/443) - Reverse Proxy + SSL
```

## 📁 Dosya Yapısı

```
.
├── deploy.sh                          # Ana deployment scripti
├── deploy-scripts/                    # Modüler deployment scriptleri
│   ├── config.sh                      # Konfigürasyon değişkenleri
│   ├── utils.sh                       # Yardımcı fonksiyonlar
│   ├── 01-check-permissions.sh        # Yetki kontrolü
│   ├── 02-check-prerequisites.sh      # Ön koşul kontrolü ve kurulum
│   ├── 03-setup-directories.sh        # Dizin yapısı oluşturma
│   ├── 04-backup-existing.sh          # Mevcut deployment yedekleme
│   ├── 05-deploy-files.sh             # Dosya deployment
│   ├── 06-setup-nginx.sh              # Nginx konfigürasyonu
│   ├── 07-stop-services.sh            # Servis durdurma
│   ├── 08-start-services.sh           # Servis başlatma
│   ├── 09-health-check.sh             # Sağlık kontrolleri
│   ├── 10-setup-ssl.sh                # SSL kurulumu
│   └── 11-show-info.sh                # Deployment bilgileri
├── docker-compose.yml                 # Docker Compose konfigürasyonu
├── muhammedtarikucar.conf             # Nginx site konfigürasyonu
└── setup-ssl.sh                       # Standalone SSL kurulum scripti
```

## 🚀 Kullanım

### Temel Deployment

```bash
# Tam deployment (önerilen)
sudo ./deploy.sh

# Dry run (sadece kontrol, değişiklik yapmaz)
sudo ./deploy.sh --dry-run

# SSL olmadan deployment
sudo ./deploy.sh --skip-ssl

# Yedekleme olmadan deployment
sudo ./deploy.sh --skip-backup
```

### Bireysel Script Çalıştırma

```bash
# Sadece yetki kontrolü
sudo ./deploy-scripts/01-check-permissions.sh

# Sadece ön koşul kontrolü
sudo ./deploy-scripts/02-check-prerequisites.sh

# Sadece sağlık kontrolü
sudo ./deploy-scripts/09-health-check.sh
```

### Hızlı Komutlar

Deployment sonrası oluşturulan hızlı erişim scripti:

```bash
# Servis durumu
./quick-commands.sh status

# Logları görüntüle
./quick-commands.sh logs

# Servisleri yeniden başlat
./quick-commands.sh restart

# Sağlık kontrolü
./quick-commands.sh health

# SSL kontrolü
./quick-commands.sh ssl

# Güncelleme
./quick-commands.sh update

# Yedekleme
./quick-commands.sh backup
```

## ⚙️ Konfigürasyon

### Ana Konfigürasyon (deploy-scripts/config.sh)

```bash
# Server Configuration
SERVER_IP="161.97.80.171"
DOMAIN="muhammedtarikucar.com"
PROJECT_NAME="muhammedtarikucar"

# Port Configuration
FRONTEND_PORT="8082"
BACKEND_PORT="5000"
MONGODB_PORT="27018"
REDIS_PORT="6380"

# SSL Configuration
SSL_EMAIL="admin@muhammedtarikucar.com"
```

### Environment Variables

Deployment sırasında otomatik olarak `.env.production` dosyası oluşturulur:

```bash
NODE_ENV=production
MONGODB_URI=mongodb://admin:password123@mongodb:27017/blog_db?authSource=admin
REDIS_URL=redis://redis:6379
CLIENT_URL=https://muhammedtarikucar.com
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-here-change-in-production
```

## 🔧 Deployment Adımları

### 1. Yetki Kontrolü (01-check-permissions.sh)
- Root yetki kontrolü
- Deploy kullanıcısı kontrolü
- Dizin yazma yetkileri
- Sistem servisleri erişimi
- DNS kontrolü

### 2. Ön Koşul Kontrolü (02-check-prerequisites.sh)
- Docker kurulumu ve versiyon kontrolü
- Docker Compose kurulumu
- Nginx kurulumu
- Certbot kurulumu
- Firewall ve güvenlik araçları

### 3. Dizin Kurulumu (03-setup-directories.sh)
- Proje dizinleri oluşturma
- Yedek dizinleri
- Log dizinleri
- SSL dizinleri
- İzin ayarları

### 4. Yedekleme (04-backup-existing.sh)
- Mevcut deployment yedekleme
- Docker volume yedekleme
- Veritabanı yedekleme
- Nginx konfigürasyon yedekleme
- Yedek sıkıştırma

### 5. Dosya Deployment (05-deploy-files.sh)
- Proje dosyalarını kopyalama
- İzin ve sahiplik ayarları
- Production environment dosyası
- Docker Compose override

### 6. Nginx Kurulumu (06-setup-nginx.sh)
- Site konfigürasyonu
- Güvenlik başlıkları
- Rate limiting
- Gzip sıkıştırma
- SSL hazırlığı

### 7. Servis Durdurma (07-stop-services.sh)
- Mevcut servisleri güvenli durdurma
- Docker container temizliği
- Port kontrolü
- Systemd servis kontrolü

### 8. Servis Başlatma (08-start-services.sh)
- Docker imaj oluşturma
- Servisleri sıralı başlatma
- Hazır olma kontrolü
- Sağlık kontrolleri

### 9. Sağlık Kontrolü (09-health-check.sh)
- Sistem kaynak kontrolü
- Docker servis kontrolü
- Veritabanı bağlantı kontrolü
- API endpoint kontrolü
- Performans kontrolü

### 10. SSL Kurulumu (10-setup-ssl.sh)
- Let's Encrypt sertifika alma
- Nginx HTTPS konfigürasyonu
- Otomatik yenileme kurulumu
- SSL test ve doğrulama

### 11. Bilgi Gösterimi (11-show-info.sh)
- Deployment özeti
- Erişim URL'leri
- Yönetim komutları
- Troubleshooting rehberi

## 📊 İzleme ve Yönetim

### Servis İzleme

```bash
# Servis durumu
cd /opt/muhammedtarikucar && docker-compose ps

# Canlı loglar
cd /opt/muhammedtarikucar && docker-compose logs -f

# Sistem kaynakları
cd /opt/muhammedtarikucar && ./monitor-services.sh
```

### SSL İzleme

```bash
# SSL durumu
cd /opt/muhammedtarikucar && ./check-ssl.sh

# Sertifika yenileme
certbot renew --dry-run
```

### Veritabanı Yönetimi

```bash
# MongoDB bağlantısı
docker exec -it blog_mongodb mongosh blog_db -u admin -p password123

# Redis bağlantısı
docker exec -it blog_redis redis-cli
```

## 🔒 Güvenlik Özellikleri

- **SSL/TLS**: Let's Encrypt ile otomatik SSL
- **Firewall**: UFW ile port kontrolü
- **Fail2ban**: Brute force koruması
- **Rate Limiting**: Nginx ile API koruması
- **Security Headers**: XSS, CSRF koruması
- **Container Security**: Docker best practices

## 📋 Troubleshooting

### Yaygın Sorunlar

#### Servisler Başlamıyor
```bash
# Docker daemon kontrolü
systemctl status docker

# Servis logları
cd /opt/muhammedtarikucar && docker-compose logs

# Yeniden başlatma
cd /opt/muhammedtarikucar && docker-compose down
cd /opt/muhammedtarikucar && docker-compose up --build -d
```

#### SSL Sorunları
```bash
# Nginx test
nginx -t

# SSL kontrol
cd /opt/muhammedtarikucar && ./check-ssl.sh

# Sertifika yenileme
certbot renew --force-renewal
```

#### DNS Sorunları
```bash
# DNS kontrol
nslookup muhammedtarikucar.com

# Propagasyon kontrolü
dig muhammedtarikucar.com
```

## 📞 Destek

### Log Konumları
- **Uygulama Logları**: `/opt/muhammedtarikucar/logs/`
- **Nginx Logları**: `/var/log/nginx/`
- **Docker Logları**: `docker-compose logs`
- **Sistem Logları**: `journalctl -u docker`

### Önemli Dosyalar
- **Deployment Özeti**: `/opt/muhammedtarikucar/DEPLOYMENT_SUMMARY.md`
- **Sağlık Raporu**: `/opt/muhammedtarikucar/HEALTH_REPORT.md`
- **Nginx Config**: `/etc/nginx/sites-available/muhammedtarikucar.com`
- **SSL Sertifikaları**: `/etc/letsencrypt/live/muhammedtarikucar.com/`

## 🔄 Güncelleme

```bash
# Kod güncellemesi sonrası
cd /opt/muhammedtarikucar
git pull  # veya dosyaları manuel kopyala
docker-compose up --build -d

# Tam yeniden deployment
sudo ./deploy.sh --skip-backup
```

## 💾 Yedekleme ve Geri Yükleme

### Otomatik Yedekleme
- Her deployment öncesi otomatik yedek
- Maksimum 5 yedek saklanır
- 30 gün sonra eski yedekler silinir

### Manuel Yedekleme
```bash
cd /opt/muhammedtarikucar
./deploy-scripts/04-backup-existing.sh
```

### Yedek Listesi
```bash
ls -la /opt/backups/muhammedtarikucar/
```

---

**Son Güncelleme**: $(date)  
**Versiyon**: 1.0  
**Proje**: muhammedtarikucar.com
