"use client";

import { useRouter } from "next/navigation";

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="bg-white min-h-screen px-6 py-12 max-w-3xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="text-[--color-primary] mb-6 flex items-center gap-2 hover:underline"
      >
        ← Back
      </button>

      {/* Title */}
      <h1 className="text-center text-2xl font-bold mb-6 text-[--color-primary]">
        Terms and conditions
      </h1>

      {/* Content box */}
      <div className="bg-pink-100 text-gray-800 p-6 rounded-lg leading-relaxed text-sm md:text-base">
        <p className="mb-4">
          By accessing and using BabyNest, you agree to comply with and be bound
          by our Terms and Conditions, which are designed to ensure the fair,
          secure, and lawful use of our services. All course materials,
          resources, text, videos, graphics, and other content made available
          through this platform are intended solely for your personal learning
          and educational purposes. Such content remains the exclusive
          intellectual property of [Your Website Name] or its authorized
          licensors, and any unauthorized sharing, reproduction, resale, or
          distribution is strictly prohibited.
        </p>

        <p className="mb-4">
          Users are responsible for maintaining the confidentiality and security
          of their account credentials. You must not allow others to access your
          account or use our services on your behalf without authorization. Any
          activity conducted through your account will be deemed your
          responsibility.
        </p>

        <p className="mb-4">
          Payments made for courses, subscriptions, or other services are
          governed by our published pricing, billing, and refund policies. We
          reserve the right, at our sole discretion, to revise pricing,
          introduce new features, modify existing services, or discontinue
          offerings at any time without prior notice.
        </p>

        <p>
          While we strive to provide uninterrupted and high-quality access, we
          do not guarantee that the platform will always function without
          errors, technical interruptions, or downtime. We are not liable for
          any data loss, technical failures, or indirect damages that may arise
          from the use of our platform or reliance on its content.
        </p>
      </div>
    </div>
  );
}
