import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@repo/ui/button";

const Navbar = () => {
    return (
        <header className="px-5 py-3 bg-white shadow-sm border-b">
            <nav className="flex justify-between items-center max-w-7xl mx-auto">
                <Link href="/" className="flex items-center">
                    <span className="text-xl font-bold text-blue-600">BabyNest</span>
                </Link>
                <div className="flex items-center gap-4">
                    <Link href="/auth/login">
                        <Button 
                            appName="web" 
                            className="px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            Login
                        </Button>
                    </Link>
                    <Link href="/auth/signup">
                        <Button 
                            appName="web" 
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Sign Up
                        </Button>
                    </Link>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;
