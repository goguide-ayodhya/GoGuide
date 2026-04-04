"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { Smartphone, CreditCard, HandHeart } from "lucide-react";

interface PaymentMethodSelectorProps {
  value: "upi" | "card" | null;
  onChange: (value: "upi" | "card") => void;
}

export function PaymentMethodSelector({
  value,
  onChange,
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">
        Select Payment Method
      </h3>

      <RadioGroup
        value={value ?? undefined}
        onValueChange={(val) => onChange(val as "upi" | "card")}
      >
        {/* UPI Option */}
        <div className="flex items-center space-x-3 cursor-pointer group">
          <RadioGroupItem value="upi" id="upi" className="cursor-pointer" />
          <label htmlFor="upi" className="flex-1 cursor-pointer">
            <Card
              className={`p-4 transition-all hover:border-primary ${
                value === "upi" ? "border-secondary bg-secondary/50" : ""
              }`}
            >
              {" "}
              <div className="flex items-center gap-3">
                <Smartphone className="h-6 w-6 text-secondary" />
                <div className="flex-1">
                  <p className="font-semibold text-foreground">UPI</p>
                  <p className="text-sm text-muted-foreground">
                    Google Pay, PhonePe, PayTM
                  </p>
                </div>
              </div>
            </Card>
          </label>
        </div>

        {/* Card Option */}
        <div className="flex items-center space-x-3 cursor-pointer group">
          <RadioGroupItem value="card" id="card" className="cursor-pointer" />
          <label htmlFor="card" className="flex-1 cursor-pointer">
            <Card
              className={`p-4 transition-all hover:border-primary ${
                value === "card" ? "border-secondary bg-secondary/50" : ""
              }`}
            >
              {" "}
              <div className="flex items-center gap-3">
                <HandHeart className="h-6 w-6 text-secondary" />
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Cash in Hand</p>
                </div>
              </div>
              {/* <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-secondary" />
                <div className="flex-1">
                  <p className="font-semibold text-foreground">
                    Card / Netbanking
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Credit, Debit, or Bank Transfer
                  </p>
                </div>
              </div> */}
            </Card>
          </label>
        </div>
      </RadioGroup>
    </div>
  );
}
