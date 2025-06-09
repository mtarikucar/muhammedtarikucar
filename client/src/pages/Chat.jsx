import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import useChat from '../hooks/useChat';
import { toast } from 'react-toastify';

const Chat = () => {
  const [messageInput, setMessageInput] = useState('');
  const [showRoomList, setShowRoomList] = useState(true);
  const [newRoomName, setNewRoomName] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  
  const messagesEndRef = useRef(null);
  const { currentUser } = useSelector((state) => state.auth);
  
  const {
    isConnected,
    currentRoom,
    messages,
    typingUsers,
    rooms,
    fetchRooms,
    createRoom,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendTyping,
    stopTyping
  } = useChat();

  useEffect(() => {
    if (currentUser) {
      fetchRooms();
    }
  }, [currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim() && currentRoom) {
      sendMessage(messageInput);
      setMessageInput('');
      stopTyping();
    }
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    if (e.target.value.trim()) {
      sendTyping();
    } else {
      stopTyping();
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (newRoomName.trim()) {
      const room = await createRoom({
        name: newRoomName.trim(),
        description: `${newRoomName} chat room`,
        type: 'public'
      });
      
      if (room) {
        setNewRoomName('');
        setShowCreateRoom(false);
        await fetchRooms();
      }
    }
  };

  const handleJoinRoom = async (roomId) => {
    await joinRoom(roomId);
    setShowRoomList(false);
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    setShowRoomList(true);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Chat</h2>
          <p className="text-gray-500">Please login to access chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Room List Sidebar */}
      {showRoomList && (
        <div className="w-1/3 bg-white border-r border-gray-300 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Chat Rooms</h2>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => setShowCreateRoom(!showCreateRoom)}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Create Room
            </button>
          </div>

          {/* Create Room Form */}
          {showCreateRoom && (
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <form onSubmit={handleCreateRoom}>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Room name"
                  className="w-full px-3 py-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="flex-1 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateRoom(false)}
                    className="flex-1 bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Rooms List */}
          <div className="flex-1 overflow-y-auto">
            {rooms.map((room) => (
              <div
                key={room._id}
                onClick={() => handleJoinRoom(room._id)}
                className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-800">{room.name}</h3>
                    <p className="text-sm text-gray-600">{room.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">{room.currentUsers} users</span>
                    <div className={`w-2 h-2 rounded-full mt-1 ${room.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Area */}
      {currentRoom ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-300 p-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{currentRoom.name}</h2>
              <p className="text-sm text-gray-600">{currentRoom.description}</p>
            </div>
            <div className="flex space-x-2">
              {!showRoomList && (
                <button
                  onClick={() => setShowRoomList(true)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                >
                  Rooms
                </button>
              )}
              <button
                onClick={handleLeaveRoom}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              >
                Leave
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${message.sender._id === currentUser.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender._id === currentUser.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-800 border border-gray-300'
                  }`}
                >
                  {message.sender._id !== currentUser.id && (
                    <p className="text-xs font-semibold mb-1 text-gray-600">
                      {message.sender.name}
                    </p>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender._id === currentUser.id ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.createdAt)}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Typing Indicators */}
            {typingUsers.length > 0 && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg">
                  <p className="text-sm">
                    {typingUsers.map(user => user.user.name).join(', ')} 
                    {typingUsers.length === 1 ? ' is' : ' are'} typing...
                  </p>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="bg-white border-t border-gray-300 p-4">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                value={messageInput}
                onChange={handleInputChange}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!isConnected}
              />
              <button
                type="submit"
                disabled={!messageInput.trim() || !isConnected}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Welcome to Chat</h2>
            <p className="text-gray-500 mb-4">Select a room to start chatting</p>
            {!showRoomList && (
              <button
                onClick={() => setShowRoomList(true)}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Show Rooms
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
