"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getProfile } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import Image from "next/image";

type Profile = {
    email: string;
    fullName?: string;
    weeksPregnant?: number;
    symptoms?: Record<string, string>;
};

type Message = {
    text: string;
    isUser: boolean;
};

export default function ChatbotPage() {
    const router = useRouter();
    const isAuthenticated = useAuth();
    const [input, setInput] = useState("");
    const [profile, setProfile] = useState<Profile | null>(null);
    const [userEmail, setUserEmail] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [showWelcome, setShowWelcome] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isAuthenticated) return;
        
        const email = localStorage.getItem("userEmail");
        setUserEmail(email || "");

        (async () => {
            try {
                const p = await getProfile();
                setProfile(p);
            } catch (e) {
                console.error(e);
            }
        })();
    }, [isAuthenticated]);

    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        return hour < 12 ? "Good morning" : "Good afternoon";
    };

    const getUserName = () => {
        return profile?.fullName || userEmail.split("@")[0] || "there";
    };

    const sendToChatbot = async (message: string) => {
        try {
            const chatbotUrl = process.env.NEXT_PUBLIC_CHATBOT_URL || "http://localhost:8003";
            const response = await fetch(`${chatbotUrl}/api/chat`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ user_request: message })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            return data.response || "I received your message but couldn't generate a response.";
        } catch (error) {
            console.error("Chatbot error:", error);
            return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
        }
    };

    const handleQuickAction = async (action: string) => {
        setShowWelcome(false);
        setMessages([{ text: action, isUser: true }]);
        setIsTyping(true);

        const response = await sendToChatbot(action);
        setIsTyping(false);
        setMessages((prev) => [...prev, { text: response, isUser: false }]);
    };

    const handleGetPregnancyTips = async () => {
        if (!profile?.weeksPregnant) {
            alert('Please update your pregnancy week in your profile first.');
            return;
        }
        
        try {
            const response = await fetch('/api/user_onboard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: profile.fullName || userEmail.split('@')[0],
                    email: userEmail,
                    pregnancyWeek: profile.weeksPregnant,
                }),
            });

            if (response.ok) {
                const action = `Get pregnancy tips for week ${profile.weeksPregnant}`;
                handleQuickAction(action);
            } else {
                alert('Failed to get pregnancy tips.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while getting pregnancy tips.');
        }
    };

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = input;
        setShowWelcome(false);
        setMessages((prev) => [...prev, { text: userMessage, isUser: true }]);
        setIsTyping(true);
        setInput("");

        const response = await sendToChatbot(userMessage);
        setIsTyping(false);
        setMessages((prev) => [...prev, { text: response, isUser: false }]);
    };

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    if (isAuthenticated === null) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="w-full max-w-none">
                {/* Back Button */}
                <button
                    onClick={() => router.push("/dashboard")}
                    className="mb-6 flex items-center text-gray-600 hover:text-gray-800"
                >
                    <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                    Back
                </button>

                {/* Greeting */}
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                        Hi {getUserName()}!
                    </h2>
                    <h3 className="text-xl text-gray-600">
                        {getTimeGreeting()}
                    </h3>
                </div>

                {showWelcome && (
                    <>
                        {/* AI Image */}
                        <div className="flex justify-center mb-8">
                            <Image
                                src="/image/AI.png"
                                alt="AI Assistant"
                                width={200}
                                height={200}
                                className="rounded-lg"
                            />
                        </div>

                        {/* What do you want to do today? */}
                        <h4 className="text-lg font-semibold text-center mb-6 text-gray-700">
                            What do you want to do today?
                        </h4>

                        {/* Quick Action Buttons */}
                        <div className="grid md:grid-cols-3 gap-4 mb-8">
                            <button
                                onClick={() => handleGetPregnancyTips()}
                                className="bg-pink-200 p-6 rounded-lg hover:bg-pink-300 transition-colors"
                            >
                                <h3 className="text-base font-semibold mb-2 text-gray-800">
                                    Pregnancy Tips
                                </h3>
                                <p className="text-gray-600 text-xs">
                                    Get personalized advice for your pregnancy week
                                </p>
                            </button>

                            <button
                                onClick={() =>
                                    handleQuickAction("I want to log a symptom")
                                }
                                className="bg-pink-200 p-6 rounded-lg hover:bg-pink-300 transition-colors"
                            >
                                <h3 className="text-base font-semibold mb-2 text-gray-800">
                                    Log a Symptom
                                </h3>
                                <p className="text-gray-600 text-xs">
                                    Quickly add how you're feeling.
                                </p>
                            </button>

                            <button
                                onClick={() =>
                                    handleQuickAction("I want to join a group")
                                }
                                className="bg-pink-200 p-6 rounded-lg hover:bg-pink-300 transition-colors"
                            >
                                <h3 className="text-base font-semibold mb-2 text-gray-800">
                                    Join a Group
                                </h3>
                                <p className="text-gray-600 text-xs">
                                    Connect with moms like you.
                                </p>
                            </button>
                        </div>
                    </>
                )}

                {/* Chat Messages */}
                {!showWelcome && (
                    <div ref={chatContainerRef} className="mb-8 max-h-96 overflow-y-auto">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`mb-4 ${msg.isUser ? "text-right" : "text-left"}`}
                            >
                                <div
                                    className={`inline-block p-3 rounded-lg max-w-xs ${
                                        msg.isUser
                                            ? "bg-[#D7656A] text-white"
                                            : "bg-white text-gray-800 shadow-sm"
                                    }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="text-left mb-4">
                                <div className="inline-block p-3 rounded-lg bg-white text-gray-800 shadow-sm">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}

                {/* Input Area */}
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                        placeholder="Type your message..."
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D7656A]"
                    />
                    <button
                        onClick={sendMessage}
                        className="px-6 py-3 bg-[#D7656A] text-white rounded-lg hover:bg-[#c55a5f] transition-colors"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
