#!/bin/bash

# SSL Sertifikası Kurulum Scripti
# muhammedtarikucar.com için Let's Encrypt SSL sertifikası

echo "=== SSL Sertifikası Kurulum Başlıyor ==="

# Domain kontrolü
echo "Domain DNS kontrolü yapılıyor..."
if ! nslookup muhammedtarikucar.com | grep -q "161.97.80.171"; then
    echo "UYARI: Domain henüz bu sunucuya yönlendirilmemiş!"
    echo "GoDaddy'de DNS ayarlarını kontrol edin:"
    echo "A Record: @ -> 161.97.80.171"
    echo "CNAME Record: www -> muhammedtarikucar.com"
    echo ""
    read -p "DNS ayarları tamamlandı ve propagasyon beklendi mi? (y/N): " confirm
    if [[ $confirm != [yY] ]]; then
        echo "DNS ayarlarını tamamlayıp tekrar çalıştırın."
        exit 1
    fi
fi

# Certbot ile SSL sertifikası alma
echo "Let's Encrypt SSL sertifikası alınıyor..."
sudo certbot --nginx -d muhammedtarikucar.com -d www.muhammedtarikucar.com \
    --non-interactive \
    --agree-tos \
    --email admin@muhammedtarikucar.com \
    --redirect

if [ $? -eq 0 ]; then
    echo "✅ SSL sertifikası başarıyla kuruldu!"
    echo "✅ HTTPS yönlendirmesi aktif!"
    
    # Nginx test
    nginx -t && systemctl reload nginx
    
    echo ""
    echo "🎉 Site hazır! Şu adreslerden erişebilirsiniz:"
    echo "https://muhammedtarikucar.com"
    echo "https://www.muhammedtarikucar.com"
    
else
    echo "❌ SSL sertifikası kurulumunda hata oluştu!"
    echo "DNS ayarlarını kontrol edin ve tekrar deneyin."
    exit 1
fi

echo "=== Kurulum Tamamlandı ==="
