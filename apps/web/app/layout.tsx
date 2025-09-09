import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import NavBar from "./components/NavBar";
import Footer from "./components/footer";
import AuthSessionProvider from "./providers/SessionProvider";

const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
});
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
});

export const metadata: Metadata = {
    title: "BabyNest - Your Pregnancy Journey Companion",
    description:
        "A supportive platform for expecting mothers with journaling, chat, and wellness tracking features.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable}`}>
                <AuthSessionProvider>
                    <NavBar />
                    {children}
                    <Footer />
                </AuthSessionProvider>
            </body>
        </html>
    );
}
