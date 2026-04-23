"use client";

import { useState } from "react";

type Props = {
  checked: boolean;
  onChange: (v: boolean) => void;
  className?: string;
};

export function TermsAndConditions({ checked, onChange, className }: Props) {
  const [open, setOpen] = useState(false);

  const sampleTerms = Array.from({ length: 40 }, (_, i) =>
    `This is sample Terms & Conditions paragraph ${i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum.`,
  ).join("\n\n");

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
            I agree to the{' '}
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
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl rounded bg-background p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Terms & Conditions</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-muted-foreground"
              >
                Close
              </button>
            </div>
            <div className="mt-3 max-h-72 overflow-auto text-sm leading-relaxed whitespace-pre-wrap">
              {sampleTerms}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded bg-primary px-3 py-1 text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TermsAndConditions;
