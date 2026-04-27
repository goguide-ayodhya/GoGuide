export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">

      <h1 className="text-3xl md:text-4xl font-bold">
        Privacy <span className="text-primary italic">Policy</span>
      </h1>

      <p className="text-muted-foreground text-sm italic">
        Your privacy is important to us. This policy explains how we collect,
        use, and protect your information when you use our platform.
      </p>

      {/* 1 */}
      <section className="space-y-2">
        <h2 className="font-semibold text-lg">1. Information We Collect</h2>
        <p className="text-sm text-muted-foreground">
          We may collect the following information:
        </p>
        <ul className="list-disc pl-6 text-sm text-muted-foreground">
          <li>Name, phone number, and email address</li>
          <li>Location and trip details</li>
          <li>Booking and transaction information</li>
          <li>Device and usage data (for analytics & security)</li>
        </ul>
      </section>

      {/* 2 */}
      <section className="space-y-2">
        <h2 className="font-semibold text-lg">2. How We Use Your Information</h2>
        <ul className="list-disc pl-6 text-sm text-muted-foreground">
          <li>To provide and manage bookings</li>
          <li>To connect you with service providers</li>
          <li>To send updates, OTPs, and notifications</li>
          <li>To improve platform performance and experience</li>
          <li>To ensure safety and prevent fraud</li>
        </ul>
      </section>

      {/* 3 */}
      <section className="space-y-2">
        <h2 className="font-semibold text-lg">3. Data Sharing</h2>
        <p className="text-sm text-muted-foreground">
          We do not sell your personal data. Your information is only shared:
        </p>
        <ul className="list-disc pl-6 text-sm text-muted-foreground">
          <li>With assigned service providers (guide/cab)</li>
          <li>With payment partners (for transaction processing)</li>
          <li>When required by law or legal authorities</li>
        </ul>
      </section>

      {/* 4 */}
      <section className="space-y-2">
        <h2 className="font-semibold text-lg">4. Data Security</h2>
        <ul className="list-disc pl-6 text-sm text-muted-foreground">
          <li>Encrypted data storage and secure APIs</li>
          <li>JWT-based authentication system</li>
          <li>Role-Based Access Control (RBAC)</li>
          <li>Regular monitoring and security checks</li>
        </ul>
      </section>

      {/* 5 */}
      <section className="space-y-2">
        <h2 className="font-semibold text-lg">5. Data Retention</h2>
        <p className="text-sm text-muted-foreground">
          We retain your data only as long as necessary to provide services
          and comply with legal obligations.
        </p>
      </section>

      {/* 6 */}
      <section className="space-y-2">
        <h2 className="font-semibold text-lg">6. Your Rights</h2>
        <ul className="list-disc pl-6 text-sm text-muted-foreground">
          <li>You can update or delete your profile information</li>
          <li>You can request data removal (subject to legal limits)</li>
          <li>You can opt out of marketing communications</li>
        </ul>
      </section>

      {/* 7 */}
      <section className="space-y-2">
        <h2 className="font-semibold text-lg">7. Third-Party Services</h2>
        <p className="text-sm text-muted-foreground">
          We may use third-party services like payment gateways and analytics
          tools. Their policies may apply separately.
        </p>
      </section>

      {/* 8 */}
      <section className="space-y-2">
        <h2 className="font-semibold text-lg">8. Policy Updates</h2>
        <p className="text-sm text-muted-foreground">
          We may update this policy from time to time. Continued use of the
          platform means you accept the updated policy.
        </p>
      </section>

    </div>
  );
}