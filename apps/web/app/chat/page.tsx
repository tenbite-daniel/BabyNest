"use client";

import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

const Chat: React.FC<{ room: string; user: string }> = ({ room, user }) => {
  const [messages, setMessages] = useState<{ sender: string; message: string; timestamp: Date }[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef<SocketIOClient.Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL);
    socketRef.current.emit('joinRoom', { room });

    socketRef.current.on('previousMessages', (prevMessages) => {
      setMessages(prevMessages);
    });

    socketRef.current.on('message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [room]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      socketRef.current?.emit('chatMessage', { room, sender: user, message: newMessage });
      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-pink-100 p-4">
      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === user ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-2 rounded-lg ${msg.sender === user ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
              <p>{msg.message}</p>
              <p className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex mt-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 p-2 border rounded-l-lg"
          placeholder="Write a message..."
        />
        <button onClick={sendMessage} className="p-2 bg-pink-500 text-white rounded-r-lg">
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;