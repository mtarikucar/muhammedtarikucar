import { useState, useEffect, useRef } from 'react';
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
  
  const { currentUser, token } = useSelector((state) => state.auth);
  const axiosPrivate = useAxiosPrivate();
  const typingTimeoutRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    if (currentUser && token) {
      const getSocketURL = () => {
        if (import.meta.env.PROD || window.location.hostname === 'muhammedtarikucar.com' || window.location.hostname === 'www.muhammedtarikucar.com') {
          return `${window.location.protocol}//${window.location.host}`;
        }
        return 'http://localhost:5000';
      };

      const newSocket = io(getSocketURL(), {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        console.log('Connected to chat server');
        toast.success('Connected to chat server');
      });

      newSocket.on('disconnect', (reason) => {
        setIsConnected(false);
        console.log('Disconnected from chat server:', reason);
        if (reason === 'io server disconnect') {
          toast.error('Disconnected from chat server');
        }
      });

      newSocket.on('connect_error', (error) => {
        setIsConnected(false);
        console.error('Socket connection error:', error);
        toast.error('Failed to connect to chat server: ' + (error.message || 'Connection failed'));
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
          msg._id === data.messageId 
            ? { ...msg, reactions: [...(msg.reactions || []), { user: data.userId, emoji: data.emoji }] }
            : msg
        ));
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [currentUser, token]);

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

    socket.emit('leave_room', { roomId: currentRoom._id });
    setCurrentRoom(null);
    setMessages([]);
    setTypingUsers([]);
  };

  // Send message
  const sendMessage = async (content, type = 'text', replyTo = null, attachments = []) => {
    if (!socket || !currentRoom || !content.trim()) return;

    const messageData = {
      roomId: currentRoom._id,
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

    socket.emit('typing_start', { roomId: currentRoom._id });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', { roomId: currentRoom._id });
    }, 3000);
  };

  // Stop typing
  const stopTyping = () => {
    if (!socket || !currentRoom) return;

    socket.emit('typing_stop', { roomId: currentRoom._id });
    
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
