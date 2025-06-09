# Çoklu Dil Desteği (Multi-Language Support)

Bu proje artık 4 dilde desteklenmektedir:
- 🇹🇷 **Türkçe** (varsayılan)
- 🇺🇸 **İngilizce**
- 🇸🇦 **Arapça** (RTL desteği ile)
- 🇫🇷 **Fransızca**

## Kurulum ve Yapılandırma

### 1. Yüklenen Paketler
```json
{
  "i18next": "^23.7.6",
  "i18next-browser-languagedetector": "^7.2.0",
  "i18next-http-backend": "^2.4.2",
  "react-i18next": "^13.5.0"
}
```

### 2. Dosya Yapısı
```
client/src/
├── i18n/
│   ├── index.js                 # i18n yapılandırması
│   └── locales/
│       ├── tr.json             # Türkçe çeviriler
│       ├── en.json             # İngilizce çeviriler
│       ├── ar.json             # Arapça çeviriler
│       └── fr.json             # Fransızca çeviriler
├── components/
│   └── LanguageSwitcher/
│       └── LanguageSwitcher.jsx # Dil değiştirici bileşen
└── styles/
    └── rtl.css                 # RTL (sağdan sola) stil desteği
```

## Özellikler

### 1. Otomatik Dil Algılama
- Tarayıcı dili otomatik algılanır
- Kullanıcı tercihi localStorage'da saklanır
- Varsayılan dil: Türkçe

### 2. RTL (Right-to-Left) Desteği
- Arapça için tam RTL desteği
- Otomatik yön değişimi (dir="rtl")
- RTL için özel CSS stilleri

### 3. Dil Değiştirici
- Navbar'da dil seçici menü
- Bayrak ikonları ile görsel gösterim
- Mobil uyumlu tasarım

### 4. Çeviri Kapsamı
- Navigasyon menüleri
- Ana sayfa içeriği
- Blog sayfası
- Hakkımda sayfası
- Footer
- Giriş/Kayıt formları
- Arama ve filtreleme
- Hata mesajları

## Kullanım

### Bileşenlerde Çeviri Kullanımı
```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('nav.home')}</h1>
      <p>{t('home.description')}</p>
    </div>
  );
}
```

### Yeni Çeviri Anahtarı Ekleme
1. `client/src/i18n/locales/tr.json` dosyasına Türkçe metni ekleyin
2. Diğer dil dosyalarına çevirileri ekleyin
3. Bileşende `t('anahtar.ismi')` ile kullanın

### Çeviri Anahtarı Örnekleri
```json
{
  "nav": {
    "home": "Ana Sayfa",
    "blog": "Blog",
    "about": "Hakkımda"
  },
  "home": {
    "greeting": "Merhaba, Ben Muhammed Tarik Ucar",
    "description": "Yazılım geliştirici..."
  }
}
```

## RTL Desteği

### CSS Sınıfları
- `[dir="rtl"]` seçicisi ile RTL stilleri
- Flexbox yön değişimi
- Margin/padding ayarları
- Metin hizalama

### Otomatik RTL Aktivasyonu
```jsx
// Layout.jsx içinde
useEffect(() => {
  const isRTL = i18n.language === 'ar';
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  document.documentElement.lang = i18n.language;
}, [i18n.language]);
```

## Dil Değiştirme

### Programatik Dil Değişimi
```jsx
import { useTranslation } from 'react-i18next';

function LanguageButton() {
  const { i18n } = useTranslation();
  
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };
  
  return (
    <button onClick={() => changeLanguage('en')}>
      English
    </button>
  );
}
```

## Gelecek Geliştirmeler

### Potansiyel İyileştirmeler
1. **Lazy Loading**: Çeviri dosyalarının ihtiyaç halinde yüklenmesi
2. **Namespace**: Büyük projeler için çeviri dosyalarının bölünmesi
3. **Pluralization**: Çoğul form desteği
4. **Date/Number Formatting**: Yerel format desteği
5. **SEO**: URL'lerde dil prefix'i (/tr/, /en/, vb.)

### Yeni Dil Ekleme
1. `client/src/i18n/locales/` klasörüne yeni dil dosyası ekleyin
2. `client/src/i18n/index.js` dosyasında yeni dili resources'a ekleyin
3. `LanguageSwitcher.jsx` dosyasında languages array'ine ekleyin
4. RTL dil ise `Layout.jsx` dosyasında RTL kontrolüne ekleyin

## Test Etme

### Dil Değişimi Testi
1. Navbar'daki dil seçiciyi kullanın
2. Tüm metinlerin değiştiğini kontrol edin
3. RTL diller için sayfa yönünün değiştiğini kontrol edin
4. localStorage'da dil tercihinin saklandığını kontrol edin

### Tarayıcı Uyumluluğu
- Chrome, Firefox, Safari, Edge
- Mobil tarayıcılar
- RTL dil desteği olan tüm modern tarayıcılar

Bu çoklu dil sistemi, kullanıcı deneyimini artırmak ve global erişilebilirliği sağlamak için tasarlanmıştır.
