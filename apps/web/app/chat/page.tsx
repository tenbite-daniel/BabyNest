"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import io, { Socket } from "socket.io-client";
import { getPreviousChatPartners, getAllUsers } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

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

const SOCKET_SERVER_URL =
    process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

const sanitizeMessage = (message: string): string => {
    return message
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;");
};

const Chat: React.FC<{ user: string }> = ({ user }) => {
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [previousUsers, setPreviousUsers] = useState<string[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const socketRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const [users, partners] = await Promise.all([
                    getAllUsers(user),
                    getPreviousChatPartners(user),
                ]);
                setAllUsers(users);
                setPreviousUsers(partners);
            } catch (error) {
                console.error("Failed to fetch chat data:", error);
            }
        }

        if (user) {
            fetchData();
        }
    }, [user]);

    useEffect(() => {
        // Initialize socket once
        if (!socketRef.current) {
            socketRef.current = io(SOCKET_SERVER_URL);
        }

        return () => {
            socketRef.current?.disconnect();
            socketRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!selectedUser || !socketRef.current) return;

        const room = [user, selectedUser].sort().join("_");
        socketRef.current.emit("joinRoom", { room });

        // Remove previous listeners
        socketRef.current.off("previousMessages");
        socketRef.current.off("message");

        // Add new listeners
        socketRef.current.on("previousMessages", (prevMessages: Message[]) => {
            setMessages(prevMessages);
        });

        socketRef.current.on("message", (message: Message) => {
            setMessages((prev) => [...prev, message]);
        });
    }, [selectedUser, user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
        if (!selectedUser || !newMessage.trim()) return;

        const room = [user, selectedUser].sort().join("_");
        socketRef.current?.emit("chatMessage", {
            room,
            sender: user,
            message: newMessage,
        });
        setNewMessage("");
    };

    const handleSelectUser = (partnerId: string) => {
        setSelectedUser(partnerId);
        setMessages([]); // Clear messages when switching users
    };

    return (
        <div className="flex h-screen bg-pink-100">
            <div className="w-1/4 p-4 border-r flex flex-col h-full">
                <h2 className="text-xl font-bold mb-4">Chat With</h2>
                <div className="flex-1 overflow-y-auto">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">Previous</h3>
                        <ul className="space-y-2">
                            {previousUsers.map((partnerId) => {
                                const userInfo = allUsers.find(
                                    (u) => u._id === partnerId
                                );
                                return (
                                    <li
                                        key={partnerId}
                                        className={`cursor-pointer hover:bg-pink-200 p-2 rounded ${selectedUser === partnerId ? "bg-pink-300" : ""}`}
                                        onClick={() =>
                                            handleSelectUser(partnerId)
                                        }
                                    >
                                        {userInfo?.fullName ||
                                            userInfo?.username ||
                                            partnerId}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-2">
                            New Users
                        </h3>
                        <ul className="space-y-2">
                            {allUsers
                                .filter((u) => !previousUsers.includes(u._id))
                                .map((newUser) => (
                                    <li
                                        key={newUser._id}
                                        className={`cursor-pointer hover:bg-pink-200 p-2 rounded ${selectedUser === newUser._id ? "bg-pink-300" : ""}`}
                                        onClick={() =>
                                            handleSelectUser(newUser._id)
                                        }
                                    >
                                        {newUser.fullName ||
                                            newUser.username ||
                                            newUser._id}
                                    </li>
                                ))}
                        </ul>
                    </div>
                </div>
            </div>
            <div className="w-3/4 p-4">
                {selectedUser ? (
                    <div className="flex flex-col h-full">
                        <div className="flex-1 overflow-y-auto space-y-2">
                            {messages.map((msg, index) => (
                                <div
                                    key={`${msg.sender}-${msg.timestamp}-${index}`}
                                    className={`flex ${msg.sender === user ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`p-2 rounded-lg ${msg.sender === user ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}
                                    >
                                        <p
                                            dangerouslySetInnerHTML={{
                                                __html: sanitizeMessage(
                                                    msg.message
                                                ),
                                            }}
                                        />
                                        <p className="text-xs text-gray-400">
                                            {new Date(
                                                msg.timestamp
                                            ).toLocaleTimeString()}
                                        </p>
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
                                onKeyPress={(e) =>
                                    e.key === "Enter" && sendMessage()
                                }
                                className="flex-1 p-2 border rounded-l-lg"
                                placeholder="Write a message..."
                            />
                            <button
                                onClick={sendMessage}
                                className="p-2 bg-pink-500 text-white rounded-r-lg"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-500">
                        Select a user to start chatting
                    </p>
                )}
            </div>
        </div>
    );
};

const ChatPage: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<string>("");
    const isAuthenticated = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) return;

        const userId = localStorage.getItem("userId");
        if (userId) {
            setCurrentUser(userId);
        }
    }, [isAuthenticated]);

    if (isAuthenticated === null) {
        return (
            <div className="flex justify-center items-center h-screen">
                Loading...
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return <Chat user={currentUser} />;
};

export default ChatPage;
