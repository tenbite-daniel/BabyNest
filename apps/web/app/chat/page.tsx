"use client";

import React, { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { getPreviousChatPartners, getAllUsers } from '../lib/api';

// Define the Message interface to match the backend structure
interface Message {
  sender: string;
  message: string;
  timestamp: Date;
}

interface User {
  _id: string;
  fullName?: string;
  username?: string;
}

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

const Chat: React.FC<{ user: string }> = ({ user }) => {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [previousUsers, setPreviousUsers] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchPreviousUsers() {
      const users = await getPreviousChatPartners(user);
      setPreviousUsers(users);
    }
    fetchPreviousUsers();

    async function fetchAllUsers() {
      const users = await getAllUsers(user);
      setAllUsers(users);
    }
    fetchAllUsers();
  }, [user]);

  useEffect(() => {
    if (!selectedUser) return;

    socketRef.current = io(SOCKET_SERVER_URL);
    const room = [user, selectedUser].sort().join('_');
    socketRef.current.emit('joinRoom', { room });

    socketRef.current.on('previousMessages', (prevMessages: Message[]) => {
      setMessages(prevMessages);
    });

    socketRef.current.on('message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [selectedUser, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!selectedUser || !newMessage.trim()) return;

    const room = [user, selectedUser].sort().join('_');
    socketRef.current?.emit('chatMessage', { room, sender: user, message: newMessage });
    setNewMessage('');
  };

  const handleSelectUser = (partnerId: string) => {
    setSelectedUser(partnerId);
    setMessages([]); // Clear messages when switching users
  };

  return (
    <div className="flex h-screen bg-pink-100">
      <div className="w-1/4 p-4 border-r">
        <h2 className="text-xl font-bold mb-4">Chat With</h2>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Previous</h3>
          <ul className="space-y-2">
            {previousUsers.map((partnerId) => {
              const userInfo = allUsers.find(u => u._id === partnerId);
              return (
                <li
                  key={partnerId}
                  className={`cursor-pointer hover:bg-pink-200 p-2 rounded ${selectedUser === partnerId ? 'bg-pink-300' : ''}`}
                  onClick={() => handleSelectUser(partnerId)}
                >
                  {userInfo?.fullName || userInfo?.username || partnerId}
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold">New Users</h3>
          <ul className="space-y-2">
            {allUsers
              .filter(u => !previousUsers.includes(u._id))
              .map((newUser) => (
                <li
                  key={newUser._id}
                  className={`cursor-pointer hover:bg-pink-200 p-2 rounded ${selectedUser === newUser._id ? 'bg-pink-300' : ''}`}
                  onClick={() => handleSelectUser(newUser._id)}
                >
                  {newUser.fullName || newUser.username || newUser._id}
                </li>
              ))}
          </ul>
        </div>
      </div>
      <div className="w-3/4 p-4">
        {selectedUser ? (
          <div className="flex flex-col h-full">
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
        ) : (
          <p className="text-center text-gray-500">Select a user to start chatting</p>
        )}
      </div>
    </div>
  );
};

export default Chat;