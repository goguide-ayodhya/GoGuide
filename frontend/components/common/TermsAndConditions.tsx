"use client";

import { useState } from "react";

type Props = {
  checked: boolean;
  onChange: (v: boolean) => void;
  className?: string;
};

const termsContent = `
1. Nature of Service
GoGuide is an aggregator platform that connects users with independent service providers (cabs, bikes, e-rickshaws, and guides). We act only as a facilitator and are not the direct service provider.

2. Booking & Confirmation
A booking is confirmed only after acceptance by the service provider.
Users must provide valid details and may be required to show a government-issued ID before the trip.

3. Partner Verification
All partners undergo KYC and document verification. However, we do not guarantee service quality or behavior.

4. Payments
Advance payments must be made only through the platform.
Remaining balance may be paid directly to the service provider.
We are not responsible for disputes in offline payments.

5. Cancellation & Refund
6 hours or more before trip: 100% refund
Less than 6 hours: cancellation charges may apply
Refunds are processed within 2–3 working days

6. User Conduct
Any misuse, illegal activity, or misconduct may result in cancellation without refund.

7. Liability
We are not liable for delays, damages, or issues caused by third-party providers or external factors.

8. Pricing
Prices may vary based on distance, demand, and service type. Final price is shown before booking.

9. Termination
We may suspend or cancel services in case of incorrect information or safety concerns.

10. Governing Law
These terms are governed by the laws of India.
`;

export function TermsAndConditions({ checked, onChange, className }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className={className}>
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border"
        />
        <div>
          <div>
            I agree to the{" "}
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="underline text-primary"
            >
              Terms & Conditions
            </button>
          </div>
        </div>
      </label>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative bg-background border rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-card/50">
              <h3 className="text-lg font-semibold text-foreground">
                Terms & Conditions
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-4 text-sm leading-relaxed">
                {termsContent.split("\n").filter(line => line.trim()).map((line, i) => {
                  const isHeading = /^[0-9]+\./.test(line.trim());

                  return (
                    <div key={i} className={isHeading ? "pt-2" : ""}>
                      {isHeading ? (
                        <h4 className="font-bold text-primary text-base mb-2 border-b border-primary/20 pb-1">
                          {line.trim()}
                        </h4>
                      ) : (
                        <p className="text-muted-foreground leading-relaxed pl-4 border-l-2 border-muted/30">
                          {line.trim()}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-4 border-t bg-card/30">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TermsAndConditions;
