# İlk adım olarak resmi Node.js imajını alalım.
FROM node:14

# Uygulamamızın çalışacağı dizini oluşturuyoruz.
WORKDIR /app

# Uygulamanın MongoDB, React, ve Express sunucusu ile ilgili bağımlılıklarını kuruyoruz.
RUN apt-get update && apt-get install -y \
    mongodb \
 && rm -rf /var/lib/apt/lists/*

# MongoDB'nin verilerini depolayacağı dizini oluşturuyoruz.
RUN mkdir -p /data/db

# Uygulamanın bağımlılıklarını Docker önbelleğine alıyoruz.
COPY package*.json ./
RUN npm install

# Uygulamanın kaynak dosyalarını kopyalıyoruz.
COPY . .

# Uygulamanın üretim sürümünü oluşturuyoruz.
RUN npm run build

# Docker container'ı çalıştığında MongoDB ve Express sunucusunu başlatmak için bir giriş noktası tanımlıyoruz.
CMD ["npm", "run", "start"]