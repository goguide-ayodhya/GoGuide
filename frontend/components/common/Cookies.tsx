"use client"

export default function CookiesPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">

      <h1 className="text-3xl md:text-4xl font-bold">
        Cookies <span className="text-primary italic">Policy</span>
      </h1>

      <p className="text-muted-foreground text-sm italic">
        This policy explains how we use cookies and similar technologies
        to improve your experience on our platform.
      </p>

      {/* 1 */}
      <section className="space-y-2">
        <h2 className="font-semibold text-lg">1. What Are Cookies?</h2>
        <p className="text-sm text-muted-foreground">
          Cookies are small text files stored on your device when you visit
          a website. They help the website remember your actions and preferences
          such as login status and settings.
        </p>
      </section>

      {/* 2 */}
      <section className="space-y-2">
        <h2 className="font-semibold text-lg">2. Why We Use Cookies</h2>
        <ul className="list-disc pl-6 text-sm text-muted-foreground">
          <li>To keep you logged in and secure your session</li>
          <li>To improve website performance and speed</li>
          <li>To understand user behavior and usage patterns</li>
          <li>To enhance overall user experience</li>
        </ul>
      </section>

      {/* 3 */}
      <section className="space-y-2">
        <h2 className="font-semibold text-lg">3. Types of Cookies We Use</h2>
        <ul className="list-disc pl-6 text-sm text-muted-foreground">
          <li><strong>Essential Cookies:</strong> Required for core functionality</li>
          <li><strong>Analytics Cookies:</strong> Help us analyze usage and improve performance</li>
          <li><strong>Preference Cookies:</strong> Remember your settings and choices</li>
        </ul>
      </section>

      {/* 4 */}
      <section className="space-y-2">
        <h2 className="font-semibold text-lg">4. Third-Party Cookies</h2>
        <p className="text-sm text-muted-foreground">
          We may use trusted third-party services (such as analytics tools)
          that place cookies on your device to help us understand how users
          interact with our platform.
        </p>
      </section>

      {/* 5 */}
      <section className="space-y-2">
        <h2 className="font-semibold text-lg">5. Managing Cookies</h2>
        <p className="text-sm text-muted-foreground">
          You can control or disable cookies through your browser settings.
          However, disabling cookies may affect certain features of the website.
        </p>
      </section>

      {/* 6 */}
      <section className="space-y-2">
        <h2 className="font-semibold text-lg">6. Consent</h2>
        <p className="text-sm text-muted-foreground">
          By using our website, you agree to our use of cookies in accordance
          with this policy.
        </p>
      </section>

    </div>
  );
}