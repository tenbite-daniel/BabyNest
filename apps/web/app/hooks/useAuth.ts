"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth(requireAuth: boolean = true) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      const token = localStorage.getItem("token");
      const authenticated = isLoggedIn === "true" && !!token;
      
      setIsAuthenticated(authenticated);
      
      if (requireAuth && !authenticated) {
        router.push("/auth/login");
      }
    };

    checkAuth();

    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("authStateChanged", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("authStateChanged", handleAuthChange);
    };
  }, [requireAuth, router]);

  return isAuthenticated;
}