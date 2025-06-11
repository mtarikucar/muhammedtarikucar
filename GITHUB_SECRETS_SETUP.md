# 🔐 GitHub Secrets Kurulum Rehberi

Bu rehber GitHub Actions için gerekli secrets'ların nasıl kurulacağını açıklar.

## 📋 Gerekli Secrets

GitHub repository'nizde **Settings > Secrets and variables > Actions** bölümünde aşağıdaki secrets'ları oluşturun:

### 🔑 SSH Erişimi

#### `SSH_PRIVATE_KEY`

**Server'da SSH key oluşturmak için:**
```bash
# Server'a SSH ile bağlan
ssh root@161.97.80.171

# SSH key pair oluştur
ssh-keygen -t rsa -b 4096 -f ~/.ssh/github_actions_key -N ""

# Public key'i authorized_keys'e ekle
cat ~/.ssh/github_actions_key.pub >> ~/.ssh/authorized_keys

# Private key'i görüntüle (GitHub'a eklemek için)
cat ~/.ssh/github_actions_key
```

**Oluşturulan private key'i GitHub Secrets'a ekleyin:**
```
-----BEGIN OPENSSH PRIVATE KEY-----
[Server'da oluşturulan private key'in tamamını buraya kopyalayın]
-----END OPENSSH PRIVATE KEY-----
```

**Not:** Yukarıdaki örnek key gerçek değildir. Server'da `cat ~/.ssh/github_actions_key` komutu ile gerçek key'i alın.

### 🔐 Güvenlik Secrets'ları (Opsiyonel - Gelişmiş Güvenlik İçin)

#### `JWT_SECRET`
```
your-super-secret-jwt-key-here-change-in-production-2024
```

#### `REFRESH_TOKEN_SECRET`
```
your-super-secret-refresh-token-key-here-change-in-production-2024
```

#### `MONGODB_ROOT_USERNAME`
```
admin
```

#### `MONGODB_ROOT_PASSWORD`
```
password123
```

#### `MONGODB_DATABASE`
```
blog_db
```

### 🐳 Docker Hub Secrets'ları (Opsiyonel - Docker Hub Kullanıyorsanız)

#### `DOCKER_USERNAME`
```
your-dockerhub-username
```

#### `DOCKER_PASSWORD`
```
your-dockerhub-password-or-token
```

## 📝 Secrets Kurulum Adımları

### 1. GitHub Repository'ye Git
- GitHub'da repository'nizi açın
- **Settings** sekmesine tıklayın

### 2. Secrets Bölümüne Git
- Sol menüden **Secrets and variables** > **Actions** seçin

### 3. Secrets Ekle
- **New repository secret** butonuna tıklayın
- Secret adını girin (örn: `SSH_PRIVATE_KEY`)
- Secret değerini yapıştırın
- **Add secret** butonuna tıklayın

### 4. Tüm Secrets'ları Ekle
Yukarıdaki listeden gerekli olan tüm secrets'ları ekleyin.

## 🔧 Deployment Kullanımı

### Otomatik Deployment
- `main` veya `master` branch'e push yapıldığında production deployment otomatik çalışır
- Pull request açıldığında test deployment otomatik çalışır

### Manuel Deployment
1. GitHub repository'de **Actions** sekmesine git
2. **Deploy to Server** workflow'unu seç
3. **Run workflow** butonuna tıkla
4. Environment seç (production/test)
5. İsteğe bağlı seçenekleri ayarla
6. **Run workflow** butonuna tıkla

## 🌐 Deployment URL'leri

### Production
- **Ana Site**: http://muhammedtarikucar.com
- **Health Check**: http://muhammedtarikucar.com/health

### Test
- **Test Site**: http://test.muhammedtarikucar.com
- **Health Check**: http://test.muhammedtarikucar.com/health
- **Test Info**: http://test.muhammedtarikucar.com/test-info

## 🔍 Troubleshooting

### SSH Connection Hatası
- `SSH_PRIVATE_KEY` secret'ının doğru olduğundan emin olun
- Server'da public key'in authorized_keys'e eklendiğini kontrol edin

### Deployment Hatası
- Server'da disk alanının yeterli olduğunu kontrol edin
- Docker ve Nginx servislerinin çalıştığını kontrol edin
- Log dosyalarını kontrol edin: `/var/log/muhammedtarikucar/`

### Health Check Hatası
- Servislerin başlatıldığını kontrol edin: `docker-compose ps`
- Port'ların açık olduğunu kontrol edin
- Firewall ayarlarını kontrol edin

## 📞 Destek

Sorun yaşadığınızda:
1. GitHub Actions logs'unu kontrol edin
2. Server'da deployment logs'unu kontrol edin
3. Health check endpoint'lerini test edin
4. Gerekirse rollback yapın
