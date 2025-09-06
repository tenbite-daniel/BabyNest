"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@repo/ui/button";
import { useRouter } from "next/navigation";

const Navbar = () => {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Check auth state on component mount
    useEffect(() => {
        const checkAuthState = () => {
            const authState = localStorage.getItem("isLoggedIn");
            setIsLoggedIn(authState === "true");
        };

        checkAuthState();

        // Listen for storage changes and custom auth events
        const handleAuthChange = () => {
            checkAuthState();
        };

        window.addEventListener("storage", handleAuthChange);
        window.addEventListener("authStateChanged", handleAuthChange);

        return () => {
            window.removeEventListener("storage", handleAuthChange);
            window.removeEventListener("authStateChanged", handleAuthChange);
        };
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setIsMenuOpen(false);

        // Trigger custom event for auth state change
        window.dispatchEvent(new CustomEvent("authStateChanged"));

        router.push("/");
    };

    return (
        <header className="w-full sticky top-0 left-0 px-5 py-3 bg-[#D9646A] shadow-sm border-b z-50">
            <nav className="w-full flex justify-between items-center z-50">
                {/* Hamburger Menu */}
                <button
                    onClick={toggleMenu}
                    className="flex flex-col justify-center items-center w-8 h-8 space-y-1 hover:opacity-80 transition-opacity"
                >
                    <span className="block w-6 h-0.5 bg-white"></span>
                    <span className="block w-6 h-0.5 bg-white"></span>
                    <span className="block w-6 h-0.5 bg-white"></span>
                </button>

                {/* Logo */}
                <Link href="/" className="flex items-center">
                    <div className="relative flex items-center bg-white rounded-bl-xl rounded-tr-xl overflow-hidden p-1">
                        <Image
                            src="/logo.png"
                            alt="BabyNest Logo"
                            width={40}
                            height={40}
                            className="rounded-bl-lg rounded-tr-lg"
                        />
                        <Image
                            src="/logo-text.png"
                            alt="BabyNest"
                            width={100}
                            height={30}
                            className="ml-1 rounded-bl-lg rounded-tr-lg color-black"
                        />
                    </div>
                </Link>

                {/* Auth Buttons */}
                <div className="flex items-center gap-4">
                    {!isLoggedIn ? (
                        <>
                            <Link
                                href="/auth/login"
                                className="text-white hover:opacity-80 transition-opacity"
                            >
                                Sign In
                            </Link>
                            <Link href="/auth/signup">
                                <Button
                                    appName="web"
                                    className="px-4 py-2 bg-white text-[#D9646A] rounded-md hover:bg-gray-100 transition-colors font-medium"
                                >
                                    Sign Up
                                </Button>
                            </Link>
                        </>
                    ) : (
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-white text-[#D9646A] rounded-md hover:bg-gray-100 transition-colors font-medium"
                        >
                            Logout
                        </button>
                    )}
                </div>
            </nav>

            {/* Sidebar Menu */}
            <div
                className={`fixed top-0 left-0 h-full w-64 mt-18 bg-[#D9646A] shadow-lg transform transition-transform duration-300 ${
                    isMenuOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex flex-col pt-10">
                    <Link
                        href="/"
                        className="px-5 py-3 text-white hover:bg-white/10 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Home
                    </Link>
                    <Link
                        href="/about"
                        className="px-5 py-3 text-white hover:bg-white/10 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        About
                    </Link>
                    <Link
                        href="/terms"
                        className="px-5 py-3 text-white hover:bg-white/10 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Terms and Services
                    </Link>

                    {isLoggedIn ? (
                        <>
                            <Link
                                href="/dashboard"
                                className="px-5 py-3 text-white hover:bg-white/10 transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/therapist"
                                className="px-5 py-3 text-white hover:bg-white/10 transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Therapist
                            </Link>

                            <Link
                                href="/chat"
                                className="px-5 py-3 text-white hover:bg-white/10 transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Chat
                            </Link>
                            <Link
                                href="/post"
                                className="px-5 py-3 text-white hover:bg-white/10 transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Post
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/auth/login"
                                className="px-5 py-3 text-white hover:bg-white/10 transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Login
                            </Link>
                            <Link
                                href="/auth/signup"
                                className="px-5 py-3 text-white hover:bg-white/10 transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
