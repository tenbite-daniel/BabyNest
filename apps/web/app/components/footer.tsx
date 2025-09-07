import Image from "next/image";
import Link from "next/link";


export default function Footer() {
  return (
    <footer className="bg-pink-50 text-gray-700 mt-12">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Logo & Description */}
        <div>
          <div className="flex items-center gap-2">
            <Image
              src="/image/LOGO.png"
              alt="BabyNest Logo"
              width={40}
              height={40}
            />
            <h2 className="text-xl font-bold text-[var(--color-primary)]">
              Baby<span className="text-[var(--color-secondary)]">Nest</span>
            </h2>
          </div>
          <p className="mt-2 text-sm">
            Caring for you and your baby, every step of the way
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="font-semibold text-[var(--color-secondary)] mb-2">
            Navigation
          </h3>
          <ul className="space-y-1 text-sm">
            <li><Link href="/">Home</Link></li>
            <li><Link href="#">Appointments</Link></li>
            <li><Link href="#">Resources</Link></li>
            <li><Link href="#">Profile</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="font-semibold text-[var(--color-secondary)] mb-2">
            Support
          </h3>
          <ul className="space-y-1 text-sm">
            <li><Link href="/about">Community</Link></li>
            <li><Link href="#">Contact</Link></li>
            <li><Link href="#">Help & Support</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="font-semibold text-[var(--color-secondary)] mb-2">
            Legal
          </h3>
          <ul className="space-y-1 text-sm">
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="#">Privacy Policy</Link></li>
            <li><Link href="#">Terms & Conditions</Link></li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-200 py-4 text-center text-xs text-gray-500">
        © 2025 BabyNest — All Rights Reserved.
      </div>
    </footer>
  );
}
