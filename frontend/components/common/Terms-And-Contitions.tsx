import { Header } from "../header";

export default function TermsAndConditions() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <h1 className="text-3xl md:text-4xl font-bold">
        Terms & <span className="text-primary italic">Conditions</span>
      </h1>

      <p className="text-muted-foreground text-sm italic">
        Your privacy is important to us. This policy explains how we collect,
        use, and protect your information when you use our platform.
      </p>

      {/* 1 */}
      <section className="space-y-2">
        <ul className="list-disc pl-6 text-sm text-muted-foreground">
          <li>
            <b className="text-lg text-secondary italic ">Nature </b> of Service GoGuide is an aggregator platform that connects
            users with independent service providers (cabs, bikes, e-rickshaws,
            and guides). We act only as a facilitator and are not the direct
            service provider.
          </li>
          <li>
            <b className="text-lg text-secondary italic ">Booking </b> & Confirmation A booking is confirmed only after
            acceptance by the service provider. Users must provide valid details
            and may be required to show a government-issued ID before the trip.
          </li>
          <li>
            <b className="text-lg text-secondary italic ">Partner </b> Verification All partners undergo KYC and document
            verification. However, we do not guarantee service quality or
            behavior.
          </li>

          <li>
            <b className="text-lg text-secondary italic ">Payments </b> Advance payments must be made only through the platform.
            Remaining balance may be paid directly to the service provider. We
            are not responsible for disputes in offline payments.
          </li>
          <li>
            <b className="text-lg text-secondary italic ">Cancellation </b> & Refund 1/2 hours (30 minutes) or more before trip:
            100% refund Less than 1/2 hours (30 minutes): cancellation charges
            may apply Refunds are processed within 2–3 working days
          </li>
          <li>
            <b className="text-lg text-secondary italic ">User </b> Conduct Any misuse, illegal activity, or misconduct may
            result in cancellation without refund.
          </li>
          <li>
            <b className="text-lg text-secondary italic ">Liability </b> We are not liable for delays, damages, or issues caused
            by third-party providers or external factors.
          </li>
          <li>
            <b className="text-lg text-secondary italic ">Pricing </b> Prices may vary based on distance, demand, and service
            type. Final price is shown before booking.
          </li>
          <li>
            <b className="text-lg text-secondary italic ">Termination </b> We may suspend or cancel services in case of
            incorrect information or safety concerns.
          </li>
          <li>
            <b className="text-lg text-secondary italic ">Governing </b> Law These terms are governed by the laws of India. `;
          </li>
        </ul>
      </section>
    </div>
  );
}
