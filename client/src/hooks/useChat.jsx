import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';
import useAxiosPrivate from './useAxiosPrivate';
import { toast } from 'react-toastify';

const useChat = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const { currentUser, token } = useSelector((state) => state.auth);
  const axiosPrivate = useAxiosPrivate();
  const typingTimeoutRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Initialize socket connection with reconnection logic
  const initializeSocket = useCallback(() => {
    if (!currentUser || !token) return;

    const getSocketURL = () => {
      if (import.meta.env.DEV) {
        // In development, use the proxy through current host
        return window.location.origin;
      }
      
      // Production URLs
      const prodDomains = ['muhammedtarikucar.com', 'www.muhammedtarikucar.com'];
      
      if (prodDomains.includes(window.location.hostname)) {
        return `${window.location.protocol}//${window.location.host}`;
      }
      
      // Default fallback
      return window.location.origin;
    };

    const newSocket = io(getSocketURL(), {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      maxReconnectionAttempts: 5,
      forceNew: false
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      setReconnectAttempts(0);
      console.log('Connected to chat server');
      
      // Only show success toast on first connect or after reconnect
      if (reconnectAttempts > 0) {
        toast.success('Chat bağlantısı yeniden kuruldu');
      }
    });

    newSocket.on('disconnect', (reason) => {
      setIsConnected(false);
      setCurrentRoom(null);
      setMessages([]);
      setTypingUsers([]);
      console.log('Disconnected from chat server:', reason);
      
      // Don't show error for intentional disconnects
      if (reason !== 'io client disconnect') {
        console.log('Attempting to reconnect...');
      }
    });

    newSocket.on('connect_error', (error) => {
      setIsConnected(false);
      console.error('Socket connection error:', error);
      
      setReconnectAttempts(prev => prev + 1);
      
      // Show error only after multiple failed attempts
      if (reconnectAttempts >= 3) {
        toast.error('Chat bağlantı sorunu: ' + (error.message || 'Bağlantı başarısız'));
      }
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected after', attemptNumber, 'attempts');
      setReconnectAttempts(0);
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
      setReconnectAttempts(prev => prev + 1);
    });

    newSocket.on('reconnect_failed', () => {
      console.error('Failed to reconnect to chat server');
      toast.error('Chat sunucusuna bağlanılamıyor. Lütfen sayfayı yenileyin.');
    });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
        toast.error(error.message || 'Chat connection error');
      });

      // Chat event listeners
      newSocket.on('room_joined', (data) => {
        setCurrentRoom(data.room);
        console.log('Joined room:', data.room.name);
      });

      newSocket.on('room_left', (data) => {
        setCurrentRoom(null);
        setMessages([]);
        console.log('Left room');
      });

      newSocket.on('new_message', (data) => {
        setMessages(prev => [...prev, data.message]);
      });

      newSocket.on('user_joined', (data) => {
        toast.info(`${data.user.name} joined the room`);
      });

      newSocket.on('user_left', (data) => {
        toast.info(`${data.user.name} left the room`);
      });

      newSocket.on('user_typing', (data) => {
        setTypingUsers(prev => {
          if (!prev.find(user => user.userId === data.userId)) {
            return [...prev, data];
          }
          return prev;
        });
      });

      newSocket.on('user_stopped_typing', (data) => {
        setTypingUsers(prev => prev.filter(user => user.userId !== data.userId));
      });

      newSocket.on('reaction_added', (data) => {
        setMessages(prev => prev.map(msg => 
          msg.id === data.messageId 
            ? { ...msg, reactions: [...(msg.reactions || []), { user: data.userId, emoji: data.emoji }] }
            : msg
        ));
      });

      setSocket(newSocket);

      return () => {
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        newSocket.close();
      };
  }, [currentUser, token, reconnectAttempts]);

  // Initialize socket on mount
  useEffect(() => {
    initializeSocket();
  }, [initializeSocket]);

  // Fetch rooms
  const fetchRooms = async () => {
    try {
      const response = await axiosPrivate.get('/chat/rooms/my');
      setRooms(response.data.data.rooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to fetch chat rooms');
    }
  };

  // Fetch public rooms
  const fetchPublicRooms = async (page = 1, limit = 20) => {
    try {
      const response = await axiosPrivate.get(`/chat/rooms/public?page=${page}&limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching public rooms:', error);
      toast.error('Failed to fetch public rooms');
      return { rooms: [], pagination: {} };
    }
  };

  // Create room
  const createRoom = async (roomData) => {
    try {
      const response = await axiosPrivate.post('/chat/rooms', roomData);
      const newRoom = response.data.data.room;
      setRooms(prev => [newRoom, ...prev]);
      toast.success('Room created successfully');
      return newRoom;
    } catch (error) {
      console.error('Error creating room:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create room';
      toast.error(errorMessage);
      return null;
    }
  };

  // Join room
  const joinRoom = async (roomId) => {
    if (!socket || !isConnected) {
      toast.error('Not connected to chat server');
      return;
    }

    try {
      // Fetch room messages first
      const response = await axiosPrivate.get(`/chat/rooms/${roomId}/messages`);
      setMessages(response.data.data.messages.reverse()); // Reverse to show oldest first

      // Join room via socket
      socket.emit('join_room', { roomId });
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error('Failed to join room');
    }
  };

  // Leave room
  const leaveRoom = () => {
    if (!socket || !currentRoom) return;

    socket.emit('leave_room', { roomId: currentRoom.id });
    setCurrentRoom(null);
    setMessages([]);
    setTypingUsers([]);
  };

  // Send message
  const sendMessage = async (content, type = 'text', replyTo = null, attachments = []) => {
    if (!socket || !currentRoom || !content.trim()) return;

    const messageData = {
      roomId: currentRoom.id,
      content: content.trim(),
      type,
      replyTo,
      attachments
    };

    socket.emit('send_message', messageData);
  };

  // Send typing indicator
  const sendTyping = () => {
    if (!socket || !currentRoom) return;

    socket.emit('typing_start', { roomId: currentRoom.id });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', { roomId: currentRoom.id });
    }, 3000);
  };

  // Stop typing
  const stopTyping = () => {
    if (!socket || !currentRoom) return;

    socket.emit('typing_stop', { roomId: currentRoom.id });
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  // Add reaction
  const addReaction = (messageId, emoji) => {
    if (!socket) return;

    socket.emit('add_reaction', { messageId, emoji });
  };

  // Fetch online users
  const fetchOnlineUsers = async (roomId = null) => {
    try {
      const url = roomId ? `/chat/users/online?roomId=${roomId}` : '/chat/users/online';
      const response = await axiosPrivate.get(url);
      setOnlineUsers(response.data.data.users);
    } catch (error) {
      console.error('Error fetching online users:', error);
    }
  };

  return {
    socket,
    isConnected,
    currentRoom,
    messages,
    onlineUsers,
    typingUsers,
    rooms,
    fetchRooms,
    fetchPublicRooms,
    createRoom,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendTyping,
    stopTyping,
    addReaction,
    fetchOnlineUsers
  };
};

export default useChat;
