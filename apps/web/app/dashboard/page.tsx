"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const router = useRouter();
    const [userEmail, setUserEmail] = useState("");

    useEffect(() => {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const email = localStorage.getItem('userEmail');
        const token = localStorage.getItem('token');
        
        if (isLoggedIn !== 'true' || !token) {
            router.push('/auth/login');
            return;
        }
        
        setUserEmail(email || '');
    }, [router]);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-[#D7656A] mb-6">Dashboard</h1>
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Welcome back!</h2>
                    <p className="text-gray-600">Email: {userEmail}</p>
                    <p className="text-gray-600 mt-2">This is your dashboard. More features coming soon!</p>
                </div>
            </div>
        </div>
    );
}