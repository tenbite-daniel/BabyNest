"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PasswordForm from "../components/PasswordForm";

interface UserProfile {
    email: string;
    username: string;
    phoneNumber: string;
    fullName?: string;
    weeksPregnant?: number;
    symptoms?: Record<string, number>;
    onboardingCompleted?: boolean;
}

export default function ProfilePage() {
    const router = useRouter();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [editData, setEditData] = useState<any>({});
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    router.push("/auth/login");
                    return;
                }

                const response = await fetch("http://localhost:5000/user/profile", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserProfile(data);
                } else {
                    router.push("/auth/login");
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
                router.push("/auth/login");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    const updateProfile = async (section: string) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            let updateData = {};
            if (section === 'personal') {
                updateData = {
                    fullName: editData.fullName,
                    username: editData.username,
                    phoneNumber: editData.phoneNumber
                };
            } else if (section === 'pregnancy') {
                updateData = {
                    weeksPregnant: editData.weeksPregnant
                };
            } else if (section === 'symptoms') {
                updateData = {
                    symptoms: editData
                };
            }

            const response = await fetch("http://localhost:5000/user/onboarding", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...userProfile,
                    ...updateData,
                    onboardingCompleted: true
                })
            });

            if (response.ok) {
                setUserProfile({...userProfile, ...updateData});
                setEditingSection(null);
                setEditData({});
            } else {
                alert("Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Error updating profile");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#D7656A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!userProfile) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-600">Unable to load profile</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8" style={{ color: "#D7656A" }}>
                    Profile
                </h1>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
                        <button
                            onClick={() => {
                                setEditingSection('personal');
                                setEditData({
                                    fullName: userProfile.fullName || '',
                                    username: userProfile.username,
                                    phoneNumber: userProfile.phoneNumber
                                });
                            }}
                            className="px-4 py-2 text-white rounded-md hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: "#D7656A" }}
                        >
                            Edit
                        </button>
                    </div>
                    {editingSection === 'personal' ? (
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={editData.fullName}
                                        onChange={(e) => setEditData({...editData, fullName: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D7656A]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                    <input
                                        type="text"
                                        value={editData.username}
                                        onChange={(e) => setEditData({...editData, username: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D7656A]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <p className="text-gray-500 text-sm">Email cannot be changed</p>
                                    <p className="text-gray-900">{userProfile.email}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={editData.phoneNumber}
                                        onChange={(e) => setEditData({...editData, phoneNumber: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D7656A]"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => updateProfile('personal')}
                                    className="px-4 py-2 text-white rounded-md hover:opacity-90 transition-opacity"
                                    style={{ backgroundColor: "#D7656A" }}
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setEditingSection(null)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <p className="text-gray-900">{userProfile.fullName || "Not provided"}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <p className="text-gray-900">{userProfile.username}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <p className="text-gray-900">{userProfile.email}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <p className="text-gray-900">{userProfile.phoneNumber}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Pregnancy Information</h2>
                        <button
                            onClick={() => {
                                setEditingSection('pregnancy');
                                setEditData({
                                    weeksPregnant: userProfile.weeksPregnant || 0
                                });
                            }}
                            className="px-4 py-2 text-white rounded-md hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: "#D7656A" }}
                        >
                            Edit
                        </button>
                    </div>
                    {editingSection === 'pregnancy' ? (
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Weeks Pregnant</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="42"
                                        value={editData.weeksPregnant}
                                        onChange={(e) => setEditData({...editData, weeksPregnant: parseInt(e.target.value) || 0})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D7656A]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Onboarding Status</label>
                                    <p className="text-gray-500 text-sm">Status cannot be changed</p>
                                    <p className="text-gray-900">
                                        {userProfile.onboardingCompleted ? "Completed" : "Not completed"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => updateProfile('pregnancy')}
                                    className="px-4 py-2 text-white rounded-md hover:opacity-90 transition-opacity"
                                    style={{ backgroundColor: "#D7656A" }}
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setEditingSection(null)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Weeks Pregnant</label>
                                <p className="text-gray-900">{userProfile.weeksPregnant || "Not provided"}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Onboarding Status</label>
                                <p className="text-gray-900">
                                    {userProfile.onboardingCompleted ? "Completed" : "Not completed"}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {userProfile.symptoms && Object.keys(userProfile.symptoms).length > 0 && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Symptom Ratings</h2>
                            <button
                                onClick={() => {
                                    setEditingSection('symptoms');
                                    setEditData({...userProfile.symptoms});
                                }}
                                className="px-4 py-2 text-white rounded-md hover:opacity-90 transition-opacity"
                                style={{ backgroundColor: "#D7656A" }}
                            >
                                Edit
                            </button>
                        </div>
                        {editingSection === 'symptoms' ? (
                            <div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                    {Object.entries(editData).map(([symptomId, rating]) => (
                                        <div key={symptomId} className="border rounded-lg p-3">
                                            <div className="mb-2">
                                                <span className="text-sm font-medium text-gray-700 capitalize">
                                                    {symptomId.replace(/([A-Z])/g, ' $1').trim()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setEditData({...editData, [symptomId]: Math.max(0, (rating as number) - 1)})}
                                                    className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100"
                                                >
                                                    -
                                                </button>
                                                <span className="text-lg font-bold min-w-[40px] text-center" style={{ color: "#D7656A" }}>
                                                    {rating}/10
                                                </span>
                                                <button
                                                    onClick={() => setEditData({...editData, [symptomId]: Math.min(10, (rating as number) + 1)})}
                                                    className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => updateProfile('symptoms')}
                                        className="px-4 py-2 text-white rounded-md hover:opacity-90 transition-opacity"
                                        style={{ backgroundColor: "#D7656A" }}
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setEditingSection(null)}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(userProfile.symptoms).map(([symptomId, rating]) => (
                                    <div key={symptomId} className="border rounded-lg p-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-700 capitalize">
                                                {symptomId.replace(/([A-Z])/g, ' $1').trim()}
                                            </span>
                                            <span className="text-lg font-bold" style={{ color: "#D7656A" }}>
                                                {rating}/10
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {!userProfile.onboardingCompleted && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Complete Your Profile</h2>
                        <p className="text-gray-600 mb-4">Finish setting up your profile to get personalized recommendations.</p>
                        <button
                            onClick={() => router.push('/onboarding')}
                            className="px-6 py-3 text-white rounded-md hover:opacity-90 transition-opacity font-medium"
                            style={{ backgroundColor: "#D7656A" }}
                        >
                            Complete Profile
                        </button>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Security</h2>
                    <button
                        onClick={() => setShowPasswordForm(true)}
                        className="px-6 py-3 text-white rounded-md hover:opacity-90 transition-opacity font-medium"
                        style={{ backgroundColor: "#D7656A" }}
                    >
                        Change Password
                    </button>
                </div>
            </div>

            {/* Password Change Modal */}
            {showPasswordForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <PasswordForm
                            mode="change"
                            onSubmit={async (data) => {
                                const token = localStorage.getItem("token");
                                if (!token) throw new Error("No authentication token");

                                const response = await fetch("http://localhost:5000/auth/change-password", {
                                    method: "POST",
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                        oldPassword: data.oldPassword,
                                        newPassword: data.newPassword
                                    })
                                });

                                if (!response.ok) {
                                    const errorData = await response.json();
                                    throw new Error(errorData.message || "Failed to change password");
                                }

                                setShowPasswordForm(false);
                                alert("Password changed successfully!");
                            }}
                            onCancel={() => setShowPasswordForm(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}