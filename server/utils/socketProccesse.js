// Socket.io olaylarını ve mesajlarını yönetmek için bir örnek kod
io.on('connection', socket => {
    // Kullanıcı bir sohbet odasına katıldığında
    socket.on('joinRoom', roomId => {
      // Socket'i ilgili sohbet odasına ekle
      if (!chatRooms[roomId]) {
        chatRooms[roomId] = new Set();
      }
      chatRooms[roomId].add(socket);
    });
  
    // Kullanıcı bir sohbet odasından ayrıldığında
    socket.on('leaveRoom', roomId => {
      // Socket'i ilgili sohbet odasından kaldır
      if (chatRooms[roomId]) {
        chatRooms[roomId].delete(socket);
      }
    });
  
    // Kullanıcı bir mesaj gönderdiğinde
    socket.on('sendMessage', async ({ roomId, sender, receiver, message }) => {
      try {
        // Mesajı veritabanına kaydet
        const newMessage = new Message({
          roomId,
          sender,
          receiver,
          message,
          timestamp: new Date()
        });
        await newMessage.save();
  
        // İlgili sohbet odasındaki kullanıcılara mesajı yayınla
        if (chatRooms[roomId]) {
          chatRooms[roomId].forEach(socket => {
            socket.emit('newMessage', newMessage);
          });
        }
      } catch (error) {
        // Hata durumunda istemciye bildir
        socket.emit('error', 'An error occurred while sending the message');
      }
    });
  });