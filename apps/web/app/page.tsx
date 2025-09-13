import Image from "next/image";


export default function Home() {
   return (
    <main className="bg-[var(--color-background)] text-gray-800 font-sans">
      {/* Header Section */}
      <section className="text-center py-10 px-4">
        <h1 className="text-5xl font-bold text-[var(--color-primary)]">
          Baby <span className="text-[var(--color-secondary)]">Nest</span>
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-6">
        <div className="  justify-center items-center gap-8 mt-6">
          <div className="w-36 h-36  rounded-xl overflow-hidden rotate-[-6deg] relative ">
            <Image
              src="/image/women-1.jpg"
              alt="From start to end"
              fill
              className="object-cover"
            />
          </div>
          <div className="w-36 h-36 relative rounded-xl overflow-hidden rotate-[-6deg]">
            <Image
              src="/image/women-2.jpg"
              alt="Find your community"
              fill
              className="object-cover"
            />
          </div>
        </div>
         <div className="w-36 h-70 relative rounded-xl overflow-hidden rotate-[-6deg]">
            <Image
              src="/image/LOGO.png"
              alt="Find your community"
              fill
              className="object-cover"
            />
          </div>

        {/* Calendar */}
        <div className="mt-6 inline-block border rounded-xl p-4 shadow-sm">
          <p className="text-sm font-semibold">October 2025</p>
          <div className="grid grid-cols-7 gap-2 mt-2 text-center text-sm">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <span key={i} className="font-medium">
                {d}
              </span>
            ))}
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
              <span
                key={day}
                className={`${
                  day === 11 || day === 15
                    ? "bg-[var(--color-primary)] text-white rounded-full px-2"
                    : ""
                }`}
              >
                {day}
              </span>
            ))}
          </div>
        </div>
        </div>
        <div className="flex flex-col justify-center items-center gap-4 mt-6 text-center">
  {/* Image */}
  <div className="w-36 h-36 relative rounded-xl overflow-hidden rotate-[-6deg]">
    <Image
      src="/image/AI.png"
      alt="Find your community"
      fill
      className="object-cover"
    />
  </div>

  {/* Text + Button */}
  <div>
    <p className="mt-4 text-lg font-medium">
      An AI powered pregnancy tracking platform
    </p>
    <button className="mt-4 px-6 py-2 rounded-2xl bg-[var(--color-primary)] text-white font-semibold hover:bg-[var(--color-secondary)] transition">
      Join Us
    </button>
  </div>
</div>
      </section>

      {/* About Us */}
      <section className="bg-pink-50 py-12 px-6 text-center">
        <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-4">
          About us
        </h2>
        <p className="max-w-2xl mx-auto text-gray-600">
          We are dedicated to supporting African women throughout their
          pregnancy and early motherhood journey. Our platform provides trusted
          information, personalized guidance, and a safe community where she can
          connect with others in similar stages, track her baby’s growth,
          journal milestones, and access professional advice. Our goal is to
          make every mother feel informed, supported, and empowered, no matter
          where she is.
        </p>
        <button className="mt-6 px-6 py-2 rounded-2xl bg-[var(--color-secondary)] text-white font-semibold hover:bg-[var(--color-primary)] transition">
          Read More About Us
        </button>
      </section>

      {/* Features */}
      <section className="py-12 px-6 text-center">
        <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-10">
          Our Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="p-6 border rounded-2xl shadow-sm bg-white">
            <h3 className="text-lg font-semibold text-[var(--color-primary)]">
              Symptoms Tracker
            </h3>
            <p className="text-gray-600 mt-2">
              Log how you’re feeling each day — from nausea to back pain — and
              get personalized tips based on your stage of pregnancy.
            </p>
          </div>

          <div className="p-6 border rounded-2xl shadow-sm bg-white">
            <h3 className="text-lg font-semibold text-[var(--color-primary)]">
              Journaling
            </h3>
            <p className="text-gray-600 mt-2">
              Capture your journey with text entries or bump photos, and build a
              timeline of memories you can look back on anytime.
            </p>
          </div>

          <div className="p-6 border rounded-2xl shadow-sm bg-white">
            <h3 className="text-lg font-semibold text-[var(--color-primary)]">
              Your Groupies
            </h3>
            <p className="text-gray-600 mt-2">
              Connect with women due around the same time or in your area. Share
              experiences, ask questions, and support each other in safe
              community spaces.
            </p>
          </div>

          <div className="p-6 border rounded-2xl shadow-sm bg-white">
            <h3 className="text-lg font-semibold text-[var(--color-primary)]">
              AI Assistant
            </h3>
            <p className="text-gray-600 mt-2">
              Get instant, tailored guidance for your symptoms, daily tips, and
              reminders to support your pregnancy every step of the way.
            </p>
          </div>
        </div>
      </section>

      {/* Therapists */}
      <section className="bg-pink-50 py-8 text-center">
        <p className="text-lg font-medium text-[var(--color-secondary)]">
          Checkout our Therapists, no payment needed.
        </p>
        <button className="mt-4 px-6 py-2 rounded-2xl bg-[var(--color-primary)] text-white font-semibold hover:bg-[var(--color-secondary)] transition">
          Ask for Free
        </button>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 text-center">
        <p className="text-xl font-semibold text-gray-700">
          This is your ultimate companion for a healthy, happy, and connected
          pregnancy journey!
        </p>
        <button className="mt-6 px-6 py-2 rounded-2xl bg-[var(--color-primary)] text-white font-semibold hover:bg-[var(--color-secondary)] transition">
          Join Us
        </button>
      </footer>
    </main>
  );
}
