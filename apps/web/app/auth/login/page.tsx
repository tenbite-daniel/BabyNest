"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GoogleOAuthButton from "../../components/GoogleOAuthButton";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Try to connect to backend first
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
                mode: "cors",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Invalid credentials");
            }

            const data = await response.json();

            // Store only essential auth state
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("userEmail", email);
            localStorage.setItem("token", data.access_token);

            // Trigger custom event for immediate navbar update
            window.dispatchEvent(new CustomEvent("authStateChanged"));

            // Check onboarding status from database
            try {
                const profileResponse = await fetch('http://localhost:5000/user/profile', {
                    headers: {
                        'Authorization': `Bearer ${data.access_token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (profileResponse.ok) {
                    const profileData = await profileResponse.json();
                    localStorage.setItem("userId", profileData._id);
                    if (profileData.onboardingCompleted) {
                        localStorage.setItem("onboardingCompleted", "true");
                        router.push("/dashboard");
                    } else {
                        router.push("/onboarding");
                    }
                } else {
                    router.push("/onboarding");
                }
            } catch (error) {
                router.push("/onboarding");
            }
        } catch (err: any) {
            // If backend is not available or CORS issue
            if (err.message === "Failed to fetch" || err.name === "TypeError") {
                setError(
                    "Cannot connect to server. Check if backend is running and CORS is enabled."
                );
            } else {
                setError(err.message || "Login failed");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="mb-8 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
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

            <div className="max-w-md mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-[#D7656A] mb-2">
                        Log In
                    </h2>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        Welcome Back!
                    </h3>
                    <p className="text-gray-600">
                        Continue your journey with care and comfort.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D7656A] focus:border-transparent"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D7656A] focus:border-transparent"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#D7656A] text-white py-2 px-4 rounded-md hover:bg-[#c55a64] transition-colors font-medium disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                {/* Forgot Password */}
                <div className="text-center mb-6">
                    <Link
                        href="/auth/forgot-password"
                        className="text-[#D7656A] hover:underline font-medium"
                    >
                        Forgot your password?
                    </Link>
                </div>

                {/* OAuth Section */}
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Or login with</p>
                    <div className="flex justify-center mb-6">
                        <GoogleOAuthButton />
                    </div>
                    <p className="text-gray-600">
                        Don't have an account?{" "}
                        <Link
                            href="/auth/signup"
                            className="text-[#D7656A] hover:underline font-medium"
                        >
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
