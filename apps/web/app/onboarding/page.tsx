"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UserData {
    fullName: string;
    username: string;
    email: string;
    phoneNumber: string;
    weeksPregnant: string;
    symptoms: string[];
}

const SYMPTOMS = [
    { id: "nausea", name: "Nausea", icon: "🤢" },
    { id: "fatigue", name: "Fatigue", icon: "😴" },
    { id: "backache", name: "Back Ache", icon: "🦴" },
    { id: "headache", name: "Headache", icon: "🤕" },
    { id: "heartburn", name: "Heartburn", icon: "🔥" },
    { id: "swelling", name: "Swelling", icon: "🦵" },
    { id: "cramping", name: "Cramping", icon: "⚡" },
    { id: "moodswings", name: "Mood Swings", icon: "😭" },
    { id: "cravings", name: "Food Cravings", icon: "🍎" },
];

export default function OnboardingPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [userData, setUserData] = useState<UserData>({
        fullName: "",
        username: "",
        email: "",
        phoneNumber: "",
        weeksPregnant: "",
        symptoms: [],
    });

    useEffect(() => {
        // Fetch user data from database
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await fetch(
                    "http://localhost:5000/user/profile",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (response.ok) {
                    const data = await response.json();

                    setUserData((prev) => ({
                        ...prev,
                        email: data.email || "",
                        username: data.username || "",
                        phoneNumber: data.phoneNumber || "",
                        fullName: data.fullName || "",
                    }));
                }
            } catch (error) {
                // Silently handle error
            }
        };

        fetchUserData();
    }, []);

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleNext = () => {
        // Validation for step 2
        if (currentStep === 2) {
            if (!userData.fullName.trim()) {
                alert("Please enter your full name");
                return;
            }
        }

        // Validation for step 3
        if (currentStep === 3) {
            if (
                !userData.weeksPregnant ||
                parseInt(userData.weeksPregnant) < 1
            ) {
                alert("Please enter how many weeks pregnant you are");
                return;
            }
        }

        if (currentStep < 5) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleSymptomToggle = (symptomId: string) => {
        setUserData((prev) => ({
            ...prev,
            symptoms: prev.symptoms.includes(symptomId)
                ? prev.symptoms.filter((s) => s !== symptomId)
                : [...prev.symptoms, symptomId],
        }));
    };

    const incrementWeeks = () => {
        const currentWeeks = parseInt(userData.weeksPregnant) || 0;
        if (currentWeeks < 42) {
            setUserData((prev) => ({
                ...prev,
                weeksPregnant: (currentWeeks + 1).toString(),
            }));
        }
    };

    const decrementWeeks = () => {
        const currentWeeks = parseInt(userData.weeksPregnant) || 0;
        if (currentWeeks > 0) {
            setUserData((prev) => ({
                ...prev,
                weeksPregnant: (currentWeeks - 1).toString(),
            }));
        }
    };

    const handleFinish = () => {
        // This will be called when step 5 is rendered
        setTimeout(() => {
            router.push("/dashboard");
        }, 3000);
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="text-center">
                        <h2
                            className="text-3xl font-bold mb-8 mt-8"
                            style={{ color: "#D7656A" }}
                        >
                            Get Started
                        </h2>

                        <div className="flex justify-center gap-4 mb-8">
                            <div className="w-32 h-32 bg-pink-100 rounded-lg flex items-center justify-center">
                                <span className="text-4xl">🤰</span>
                            </div>
                            <div className="w-32 h-32 bg-pink-100 rounded-lg flex items-center justify-center">
                                <span className="text-4xl">👶</span>
                            </div>
                        </div>

                        <p className="text-gray-600 text-lg mb-8 px-4">
                            Track your baby's growth, connect with moms, and get
                            daily tips and therapy support.
                        </p>

                        <div className="flex justify-center">
                            <button
                                onClick={handleNext}
                                className="max-w-md w-full text-white px-8 py-3 font-medium hover:opacity-90 transition-opacity"
                                style={{
                                    backgroundColor: "#D9646A",
                                    borderRadius: "50px",
                                }}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div>
                        <div className="px-6">
                            <button
                                onClick={handleBack}
                                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-6"
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
                        </div>

                        <div className="text-center mb-6">
                            <h2
                                className="text-2xl font-bold mb-4"
                                style={{ color: "#D7656A" }}
                            >
                                Profile Setup
                            </h2>

                            <p className="text-gray-600 mb-3 md:whitespace-nowrap">
                                Set up your profile so we can provide tips,
                                advices, and resources tailored to your
                                pregnancy journey.
                            </p>

                            <p className="text-gray-500 text-sm">
                                Don't worry - you can update this information
                                anytime.
                            </p>
                        </div>

                        <div className="px-6 max-w-md mx-auto space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={userData.fullName}
                                    onChange={(e) =>
                                        setUserData((prev) => ({
                                            ...prev,
                                            fullName: e.target.value,
                                        }))
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D7656A] focus:border-transparent"
                                    placeholder="Enter your full name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={userData.username}
                                    onChange={(e) =>
                                        setUserData((prev) => ({
                                            ...prev,
                                            username: e.target.value,
                                        }))
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D7656A] focus:border-transparent"
                                    placeholder="Enter your username"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={userData.email}
                                    onChange={(e) =>
                                        setUserData((prev) => ({
                                            ...prev,
                                            email: e.target.value,
                                        }))
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D7656A] focus:border-transparent"
                                    placeholder="Enter your email"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={userData.phoneNumber}
                                    onChange={(e) =>
                                        setUserData((prev) => ({
                                            ...prev,
                                            phoneNumber: e.target.value,
                                        }))
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D7656A] focus:border-transparent"
                                    placeholder="Enter your phone number"
                                />
                            </div>
                        </div>

                        <div className="px-6 flex justify-center">
                            <button
                                onClick={handleNext}
                                disabled={!userData.fullName.trim()}
                                className="max-w-md w-full mt-8 text-white py-3 font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                    backgroundColor: "#D9646A",
                                    borderRadius: "50px",
                                }}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div>
                        <div className="px-6">
                            <button
                                onClick={handleBack}
                                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-6"
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
                        </div>

                        <div className="text-center mb-8">
                            <h2
                                className="text-2xl font-bold mb-6"
                                style={{ color: "#D7656A" }}
                            >
                                Profile Setup
                            </h2>

                            <p className="text-gray-600 mb-8">
                                How many weeks pregnant are you?
                            </p>

                            <div className="flex items-center justify-center gap-4 mb-8">
                                <button
                                    onClick={decrementWeeks}
                                    className="flex items-center justify-center hover:opacity-80 transition-opacity"
                                    style={{ width: "110px", height: "150px" }}
                                >
                                    <svg
                                        className="w-30 h-32"
                                        fill="none"
                                        stroke="#D7656A"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={4}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </button>

                                <div className="text-4xl font-bold text-gray-800 min-w-[80px]">
                                    {userData.weeksPregnant || "0"}
                                </div>

                                <button
                                    onClick={incrementWeeks}
                                    className="flex items-center justify-center hover:opacity-80 transition-opacity"
                                    style={{ width: "110px", height: "150px" }}
                                >
                                    <svg
                                        className="w-30 h-32"
                                        fill="none"
                                        stroke="#D7656A"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={4}
                                            d="M5 15l7-7 7 7"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="px-6 flex justify-center">
                            <button
                                onClick={handleNext}
                                disabled={
                                    !userData.weeksPregnant ||
                                    parseInt(userData.weeksPregnant) < 1
                                }
                                className="max-w-md w-full text-white py-3 font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                    backgroundColor: "#D7656A",
                                    borderRadius: "50px",
                                }}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div>
                        <div className="px-6">
                            <button
                                onClick={handleBack}
                                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-6"
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
                        </div>

                        <div className="text-center mb-6">
                            <h2
                                className="text-2xl font-bold mb-4"
                                style={{ color: "#D7656A" }}
                            >
                                Please input your symptoms
                            </h2>
                            <p className="text-gray-600 mb-6">
                                We use this information to create a personalized
                                feed for you.
                            </p>
                        </div>

                        <div className="px-10">
                            <div className="px-6 grid grid-cols-3 gap-4 mb-8">
                                {SYMPTOMS.map((symptom) => (
                                    <div
                                        key={symptom.id}
                                        onClick={() =>
                                            handleSymptomToggle(symptom.id)
                                        }
                                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all text-center ${
                                            userData.symptoms.includes(
                                                symptom.id
                                            )
                                                ? "border-[#D7656A] bg-pink-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                    >
                                        <div className="text-2xl mb-2">
                                            {symptom.icon}
                                        </div>

                                        <input
                                            type="checkbox"
                                            checked={userData.symptoms.includes(
                                                symptom.id
                                            )}
                                            onChange={() => {}}
                                            className="mt-2"
                                        />
                                        <div className="text-sm font-medium text-gray-700">
                                            {symptom.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="px-6 flex justify-center">
                            <button
                                onClick={handleNext}
                                className="max-w-md w-full text-white py-3 font-medium hover:opacity-90 transition-opacity"
                                style={{
                                    backgroundColor: "#D7656A",
                                    borderRadius: "50px",
                                }}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                );

            case 5:
                // Start the redirect timer when this step is rendered
                if (currentStep === 5) {
                    const saveOnboardingData = async () => {
                        try {
                            const token = localStorage.getItem("token");
                            await fetch(
                                "http://localhost:5000/user/onboarding",
                                {
                                    method: "POST",
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                        fullName: userData.fullName,
                                        weeksPregnant: parseInt(
                                            userData.weeksPregnant
                                        ),
                                        symptoms: userData.symptoms,
                                        onboardingCompleted: true,
                                    }),
                                }
                            );
                        } catch (error) {
                            // Silently handle error
                        }
                    };

                    saveOnboardingData();

                    setTimeout(() => {
                        localStorage.setItem("onboardingCompleted", "true");
                        router.push("/dashboard");
                    }, 3000);
                }
                return (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                            Tailoring Your Profile
                        </h2>
                        <div className="mb-8">
                            <div className="w-16 h-16 border-4 border-[#D7656A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">
                                We're personalizing your experience...
                            </p>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8">
            {/* Step Content */}
            <div>{renderStep()}</div>
        </div>
    );
}
