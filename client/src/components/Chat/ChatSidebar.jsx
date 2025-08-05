import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  UserGroupIcon,
  MinusIcon,
  ChevronRightIcon,
  SignalIcon,
  SignalSlashIcon
} from '@heroicons/react/24/outline';
import {
  Typography,
  Button,
  Input,
  Card,
  CardBody,
  Avatar,
  Badge,
  Spinner
} from '@material-tailwind/react';
import { toast } from 'react-toastify';

import useChat from '../../hooks/useChat';

const ChatSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const messagesEndRef = useRef(null);
  
  const { currentUser } = useSelector((state) => state.auth);
  
  const {
    socket,
    isConnected,
    currentRoom,
    messages,
    onlineUsers,
    typingUsers,
    rooms,
    fetchRooms,
    fetchPublicRooms,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendTyping,
    stopTyping,
  } = useChat();

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch rooms when component mounts
  useEffect(() => {
    if (currentUser && isConnected) {
      fetchRooms();
    }
  }, [currentUser, isConnected]);

  // Handle room selection
  const handleRoomSelect = async (room) => {
    if (currentRoom && currentRoom.id === room.id) return;
    
    if (currentRoom) {
      leaveRoom();
    }
    
    setSelectedRoom(room);
    await joinRoom(room.id);
  };

  // Handle send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !currentRoom) return;

    await sendMessage(messageText);
    setMessageText('');
    stopTyping();
  };

  // Handle typing
  const handleTyping = () => {
    sendTyping();
  };

  // Format time
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!currentUser) return null;

  return (
    <>
      {/* Chat Button - Fixed position */}
      <div className="fixed bottom-4 right-4 z-50">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                size="lg"
                className="rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
                color="blue"
                onClick={() => setIsOpen(true)}
              >
                <div className="relative">
                  <ChatBubbleLeftRightIcon className="w-6 h-6" />
                  {isConnected ? (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  ) : (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chat Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl border-l z-40 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-blue-50">
              <div className="flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-600" />
                <Typography variant="h6" color="blue-gray">
                  Chat
                </Typography>
                {isConnected ? (
                  <SignalIcon className="w-4 h-4 text-green-500" />
                ) : (
                  <SignalSlashIcon className="w-4 h-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="text"
                  size="sm"
                  className="p-1"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  <MinusIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant="text"
                  size="sm"
                  className="p-1"
                  onClick={() => setIsOpen(false)}
                >
                  <XMarkIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Connection Status */}
                {!isConnected && (
                  <div className="p-4 bg-red-50 border-b">
                    <div className="flex items-center gap-2 text-red-600">
                      <SignalSlashIcon className="w-4 h-4" />
                      <Typography variant="small">
                        Bağlantı kesildi. Yeniden bağlanıyor...
                      </Typography>
                    </div>
                  </div>
                )}

                {/* Current Room Header */}
                {currentRoom && (
                  <div className="p-4 bg-gray-50 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <Typography variant="small" className="font-medium">
                          {currentRoom.name}
                        </Typography>
                        <Typography variant="small" color="gray">
                          {currentRoom.description}
                        </Typography>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <UserGroupIcon className="w-4 h-4" />
                        <Typography variant="small">
                          {onlineUsers.length}
                        </Typography>
                      </div>
                    </div>
                    {typingUsers.length > 0 && (
                      <Typography variant="small" color="gray" className="mt-1 italic">
                        {typingUsers.map(user => user.user.name).join(', ')} yazıyor...
                      </Typography>
                    )}
                  </div>
                )}

                {/* Messages Area */}
                <div className="flex-1 flex flex-col">
                  {!currentRoom ? (
                    <div className="flex-1 p-4">
                      <Typography variant="small" color="gray" className="mb-4">
                        Sohbet odaları:
                      </Typography>
                      <div className="space-y-2">
                        {rooms.map((room) => (
                          <Card
                            key={room.id}
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => handleRoomSelect(room)}
                          >
                            <CardBody className="p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <Typography variant="small" className="font-medium">
                                    {room.name}
                                  </Typography>
                                  <Typography variant="small" color="gray">
                                    {room.description}
                                  </Typography>
                                </div>
                                <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                              </div>
                            </CardBody>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Messages List */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.map((message, index) => (
                          <div
                            key={message.id || index}
                            className={`flex ${message.sender?.id === currentUser.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-xs ${message.sender?.id === currentUser.id ? 'order-2' : 'order-1'}`}>
                              <div
                                className={`p-3 rounded-lg ${
                                  message.sender?.id === currentUser.id
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {message.sender?.id !== currentUser.id && (
                                  <Typography variant="small" className="opacity-75 mb-1">
                                    {message.sender?.name || 'Anonim'}
                                  </Typography>
                                )}
                                <Typography variant="small">
                                  {message.content}
                                </Typography>
                                <Typography variant="small" className="opacity-75 mt-1 text-xs">
                                  {formatTime(message.createdAt)}
                                </Typography>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Message Input */}
                      <div className="p-4 border-t">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                          <Input
                            value={messageText}
                            onChange={(e) => {
                              setMessageText(e.target.value);
                              handleTyping();
                            }}
                            placeholder="Mesajınızı yazın..."
                            disabled={!isConnected}
                            className="flex-1"
                            size="sm"
                          />
                          <Button
                            type="submit"
                            size="sm"
                            disabled={!messageText.trim() || !isConnected}
                            className="shrink-0"
                          >
                            <PaperAirplaneIcon className="w-4 h-4" />
                          </Button>
                        </form>
                        {currentRoom && (
                          <Button
                            variant="text"
                            size="sm"
                            onClick={() => {
                              leaveRoom();
                              setSelectedRoom(null);
                            }}
                            className="mt-2 w-full"
                          >
                            Odadan Çık
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-20 z-30"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatSidebar;