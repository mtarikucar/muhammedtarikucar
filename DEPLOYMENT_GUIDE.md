# 🚀 Deployment Guide

Bu rehber muhammedtarikucar.com projesinin production ve test ortamlarına nasıl deploy edileceğini açıklar.

## 📋 Ön Koşullar

- Ubuntu 20.04+ server
- Root erişimi
- Domain DNS ayarları yapılmış olmalı
- En az 2GB RAM ve 10GB disk alanı

## 🔧 Hızlı Başlangıç

### 1. Sistemi Hazırla

```bash
# Root olarak giriş yap
sudo su -

# Projeyi klonla
git clone <repository-url>
cd muhammedtarikucar

# Hızlı düzeltme scriptini çalıştır
./quick-deploy-fix.sh
```

### 2. Production Deployment

```bash
# Production ortamına deploy et
./deploy.sh
```

### 3. Test Deployment

```bash
# Test ortamına deploy et
./deploy-test.sh
```

## 🌐 Domain Konfigürasyonu

### Production
- **Ana Domain**: muhammedtarikucar.com
- **WWW Domain**: www.muhammedtarikucar.com
- **Frontend Port**: 3000
- **Backend Port**: 5000

### Test
- **Test Domain**: test.muhammedtarikucar.com
- **WWW Test Domain**: www.test.muhammedtarikucar.com
- **Frontend Port**: 3001
- **Backend Port**: 5001

## 📁 Dizin Yapısı

```
/opt/muhammedtarikucar/          # Production files
/opt/muhammedtarikucar-test/     # Test files
/var/log/muhammedtarikucar/      # Production logs
/var/log/muhammedtarikucar-test/ # Test logs
/var/backups/muhammedtarikucar/  # Backups
```

## 🔍 Deployment Scriptleri

### Ana Scriptler
- `deploy.sh` - Production deployment
- `deploy-test.sh` - Test deployment
- `quick-deploy-fix.sh` - Hızlı sorun giderme

### Modüler Scriptler (deploy-scripts/)
- `00-pre-deployment-check.sh` - Ön kontroller
- `01-check-permissions.sh` - Yetki kontrolü
- `02-check-prerequisites.sh` - Gereksinimler
- `03-setup-directories.sh` - Dizin kurulumu
- `04-backup-existing.sh` - Yedekleme
- `05-deploy-files.sh` - Dosya deployment
- `06-setup-nginx.sh` - Nginx konfigürasyonu
- `07-stop-services.sh` - Servisleri durdur
- `08-start-services.sh` - Servisleri başlat
- `09-health-check.sh` - Sağlık kontrolü
- `10-setup-ssl.sh` - SSL kurulumu
- `11-show-info.sh` - Bilgi göster
- `12-rollback.sh` - Geri alma
- `13-health-monitor.sh` - Sürekli izleme

## 🐳 Docker Servisleri

### Production
```bash
cd /opt/muhammedtarikucar
docker-compose ps
docker-compose logs -f
```

### Test
```bash
cd /opt/muhammedtarikucar-test
docker-compose ps
docker-compose logs -f
```

## 🔧 Sorun Giderme

### Nginx Sorunları
```bash
# Nginx durumunu kontrol et
systemctl status nginx

# Nginx konfigürasyonunu test et
nginx -t

# Nginx'i yeniden başlat
systemctl restart nginx
```

### Docker Sorunları
```bash
# Docker durumunu kontrol et
systemctl status docker

# Container'ları kontrol et
docker ps -a

# Logları kontrol et
docker-compose logs
```

### Deployment Sorunları
```bash
# Hızlı düzeltme
./quick-deploy-fix.sh

# Dry run ile test et
./deploy.sh --dry-run
./deploy-test.sh --dry-run
```

## 📊 Monitoring

### Health Check Endpoints
- Production: `http://muhammedtarikucar.com/health`
- Test: `http://test.muhammedtarikucar.com/health`
- Test Info: `http://test.muhammedtarikucar.com/test-info`

### Log Dosyaları
```bash
# Nginx logs
tail -f /var/log/muhammedtarikucar/access.log
tail -f /var/log/muhammedtarikucar/error.log

# Application logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 🔒 SSL Kurulumu

SSL otomatik olarak kurulur, ancak manuel kurulum için:

```bash
# SSL kurulumu
./deploy-scripts/10-setup-ssl.sh

# Certbot ile manuel kurulum
certbot --nginx -d muhammedtarikucar.com -d www.muhammedtarikucar.com
```

## 🔄 Güncelleme

```bash
# Kodu güncelle
git pull origin main

# Production'ı güncelle
./deploy.sh

# Test'i güncelle
./deploy-test.sh
```

## 📋 Deployment Seçenekleri

### Production Deployment
```bash
./deploy.sh                    # Normal deployment
./deploy.sh --dry-run         # Sadece kontrol et
./deploy.sh --skip-ssl        # SSL olmadan
./deploy.sh --skip-backup     # Yedekleme olmadan
```

### Test Deployment
```bash
./deploy-test.sh              # Normal test deployment
./deploy-test.sh --dry-run    # Sadece kontrol et
./deploy-test.sh --skip-backup # Yedekleme olmadan
```

## 🆘 Acil Durum

### Rollback
```bash
# Son yedekten geri yükle
./deploy-scripts/12-rollback.sh

# Zorla geri yükle
./deploy-scripts/12-rollback.sh --force
```

### Servisleri Durdur
```bash
# Production
cd /opt/muhammedtarikucar && docker-compose down

# Test
cd /opt/muhammedtarikucar-test && docker-compose down
```

## 📞 Destek

Sorun yaşadığınızda:

1. `./quick-deploy-fix.sh` çalıştırın
2. Log dosyalarını kontrol edin
3. `--dry-run` ile test edin
4. Gerekirse rollback yapın

## 🎯 Test Checklist

Deployment sonrası kontrol edilecekler:

- [ ] Ana site erişilebilir: http://muhammedtarikucar.com
- [ ] Test site erişilebilir: http://test.muhammedtarikucar.com
- [ ] API çalışıyor: /api/health
- [ ] Database bağlantısı var
- [ ] Nginx çalışıyor
- [ ] Docker container'lar çalışıyor
- [ ] SSL sertifikası geçerli (production)
- [ ] Log dosyaları yazılıyor
