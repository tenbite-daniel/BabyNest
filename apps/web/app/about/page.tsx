
export default function AboutPage() {
  return (
    <div className="bg-white text-gray-800 px-6 py-12 max-w-4xl mx-auto leading-relaxed">
      {/* About Us */}
      <h1 className="text-center text-2xl font-bold mb-6 text-[--color-primary]">
        About Us
      </h1>
      <p className="mb-8 text-center">
        This Africa-focused pregnancy and postpartum platform is created to guide
        and support you through every stage of your journey. From gentle
        reminders and health tips to reliable information you can trust, it’s
        designed to make each step a little easier and more reassuring. The
        purpose is to give you peace of mind, encouragement, and the confidence
        to care for yourself and your baby with love and strength.
      </p>

      {/* Mission */}
      <h2 className="text-xl font-semibold mb-3 text-[--color-secondary]">
        Our Mission
      </h2>
      <p className="mb-10">
        To support and empower mothers at every stage of pregnancy by providing
        gentle guidance, trusted resources, and timely reminders, helping them
        feel confident, cared for, and connected to their journey.
      </p>

      {/* Values */}
      <h2 className="text-xl font-semibold mb-6 text-[--color-secondary]">
        Our Values
      </h2>

      <div className="space-y-6">
        {/* Care & Compassion */}
        <div className="flex items-start gap-4">
          <span className="text-[--color-primary] text-2xl">❤️</span>
          <div>
            <h3 className="font-semibold text-lg">Care & Compassion</h3>
            <p>Every feature is designed with love and understanding for moms-to-be.</p>
          </div>
        </div>

        {/* Trust & Reliability */}
        <div className="flex items-start gap-4">
          <span className="text-[--color-primary] text-2xl">✔️</span>
          <div>
            <h3 className="font-semibold text-lg">Trust & Reliability</h3>
            <p>Providing accurate, evidence-based information for peace of mind.</p>
          </div>
        </div>

        {/* Support & Empowerment */}
        <div className="flex items-start gap-4">
          <span className="text-[--color-primary] text-2xl">⭐</span>
          <div>
            <h3 className="font-semibold text-lg">Support & Empowerment</h3>
            <p>
              Encouraging confidence and well-being through every stage of pregnancy.
            </p>
          </div>
        </div>

        {/* Accessibility & Simplicity */}
        <div className="flex items-start gap-4">
          <span className="text-[--color-primary] text-2xl">📱</span>
          <div>
            <h3 className="font-semibold text-lg">Accessibility & Simplicity</h3>
            <p>
              Easy-to-use tools and reminders so moms can focus on themselves and
              their baby.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
