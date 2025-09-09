"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function AuthCallback() {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.accessToken && session?.user) {
      // Store auth data in localStorage
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("token", session.accessToken as string);
      localStorage.setItem("userEmail", session.user.email || "");
      localStorage.setItem("userId", session.user._id || "");
      
      // Trigger auth state change event
      window.dispatchEvent(new CustomEvent("authStateChanged"));
      
      // Check onboarding status
      if (session.user.onboardingCompleted) {
        localStorage.setItem("onboardingCompleted", "true");
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
    }
  }, [session, router]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D7656A] mx-auto mb-4"></div>
        <p>Completing sign in...</p>
      </div>
    </div>
  );
}