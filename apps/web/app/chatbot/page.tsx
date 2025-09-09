"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getProfile } from "../lib/api";
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
    const [input, setInput] = useState("");
    const [profile, setProfile] = useState<Profile | null>(null);
    const [userEmail, setUserEmail] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [showWelcome, setShowWelcome] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const isLoggedIn = localStorage.getItem("isLoggedIn");
        const email = localStorage.getItem("userEmail");
        const token = localStorage.getItem("token");

        if (isLoggedIn !== "true" || !token) {
            router.push("/auth/login");
            return;
        }

        setUserEmail(email || "");

        (async () => {
            try {
                const p = await getProfile();
                setProfile(p);
            } catch (e) {
                console.error(e);
            }
        })();
    }, [router]);

    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        return hour < 12 ? "Good morning" : "Good afternoon";
    };

    const getUserName = () => {
        return profile?.fullName || userEmail.split("@")[0] || "there";
    };

    const handleQuickAction = (action: string) => {
        setShowWelcome(false);
        setMessages([{ text: action, isUser: true }]);
        setIsTyping(true);

        setTimeout(() => {
            setIsTyping(false);
            setMessages((prev) => [
                ...prev,
                {
                    text: "Thank you for your question! I'm here to help with your pregnancy journey.",
                    isUser: false,
                },
            ]);
        }, 2000);
    };

    const sendMessage = () => {
        if (!input.trim()) return;

        setShowWelcome(false);
        setMessages((prev) => [...prev, { text: input, isUser: true }]);
        setIsTyping(true);
        setInput("");

        setTimeout(() => {
            setIsTyping(false);
            setMessages((prev) => [
                ...prev,
                {
                    text: "Thank you for your message! I'm here to help with pregnancy-related questions.",
                    isUser: false,
                },
            ]);
        }, 2000);
    };

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

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
                                onClick={() =>
                                    handleQuickAction(
                                        "I want pregnancy tips tailored to my week"
                                    )
                                }
                                className="bg-pink-200 p-6 rounded-lg hover:bg-pink-300 transition-colors"
                            >
                                <h3 className="text-base font-semibold mb-2 text-gray-800">
                                    Pregnancy Tips
                                </h3>
                                <p className="text-gray-600 text-xs">
                                    Do you want your daily advice tailored to
                                    your week?
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
                                    Typing...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}

                {/* Input Section */}
                <div className="bg-[#D7656A] p-6 rounded-lg">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) =>
                                e.key === "Enter" && sendMessage()
                            }
                            placeholder="Type your message..."
                            className="flex-1 p-3 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
                        />
                        <button
                            onClick={sendMessage}
                            className="p-3 bg-white text-[#D7656A] rounded-lg hover:bg-gray-100"
                        >
                            <svg
                                className="w-5 h-5"
                                style={{ transform: "rotate(45deg)" }}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
