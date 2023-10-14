# İlk olarak, kullanmak istediğiniz temel Docker görüntüsünü belirtin
FROM node:14

# Çalışma dizinini oluşturun ve bu dizini varsayılan olarak ayarlayın
WORKDIR /app

# Bağımlılıkları kopyalayın ve paketleri yükleyin
COPY package*.json ./
RUN npm install

# Proje dosyalarını kopyalayın
COPY . .

# İstemci tarafındaki React uygulamasını oluşturun
WORKDIR /app/client
RUN npm install
RUN npm run build

# Sunucu tarafında çalıştırılacak komutları belirtin
WORKDIR /app/server
EXPOSE 5000
CMD [ "npm", "start" ]
