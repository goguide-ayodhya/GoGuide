"use client";

import { useState } from "react";
import TermsAndConditions from "@/components/common/TermsAndConditions";

const page = () => {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Terms and Conditions</h1>
        <p className="text-muted-foreground text-sm italic mt-2">
          Review the agreement below and accept the terms to proceed.
        </p>
      </div>

      <TermsAndConditions checked={agreed} onChange={setAgreed} />
    </div>
  );
};

export default page;
