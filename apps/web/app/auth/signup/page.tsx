"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GoogleOAuthButton from "../../components/GoogleOAuthButton";

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: "",
        phoneNumber: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: formData.username,
                        phoneNumber: formData.phoneNumber,
                        email: formData.email,
                        password: formData.password,
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Registration failed");
            }

            const data = await response.json();
            
            // Redirect to login page
            router.push('/auth/login');
        } catch (err: any) {
            setError(err.message || "Registration failed");
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
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
            </button>

            <div className="max-w-md mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-[#D7656A] mb-2">Sign Up</h2>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Join The Journey!</h3>
                    <p className="text-gray-600">Continue your journey with care and comfort.</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} method="POST" action="#" className="space-y-4 mb-6">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                            type="text"
                            name="username"
                            required
                            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D7656A] focus:border-transparent"
                            value={formData.username}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            required
                            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D7656A] focus:border-transparent"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D7656A] focus:border-transparent"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D7656A] focus:border-transparent"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            required
                            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D7656A] focus:border-transparent"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full max-w-md bg-[#D7656A] text-white py-2 px-4 rounded-md hover:bg-[#c55a64] transition-colors disabled:opacity-50 font-medium"
                    >
                        {loading ? "Signing up..." : "Sign Up"}
                    </button>
                </form>

                {/* OAuth Section */}
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Or Sign Up with</p>
                    <div className="flex justify-center mb-6">
                        <GoogleOAuthButton />
                    </div>
                    <p className="text-gray-600">
                        Already have an account?{" "}
                        <Link href="/auth/login" className="text-[#D7656A] hover:underline font-medium">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
