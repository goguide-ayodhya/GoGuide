"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Banknote, IndianRupee, Percent } from "lucide-react";

export type BookingPaymentMode = "FULL" | "PARTIAL" | "COD";

interface BookingPaymentOptionsProps {
  value: BookingPaymentMode | null;
  onChange: (value: BookingPaymentMode) => void;
  disabled?: boolean;
}

export function BookingPaymentOptions({
  value,
  onChange,
  disabled,
}: BookingPaymentOptionsProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">
        How would you like to pay?
      </h3>

      <RadioGroup
        value={value ?? undefined}
        onValueChange={(val) => onChange(val as BookingPaymentMode)}
        disabled={disabled}
        className="space-y-2"
      >
        <div className="flex items-center space-x-3 cursor-pointer group">
          <RadioGroupItem value="COD" id="cod" className="cursor-pointer" />
          <label htmlFor="cod" className="flex-1 cursor-pointer">
            <Card
              className={`p-4 transition-all hover:border-primary ${
                value === "COD" ? "border-secondary bg-secondary/50" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <Banknote className="h-6 w-6 text-secondary shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Cash in hand</p>
                  <p className="text-sm text-muted-foreground">
                    Pay with cash to your guide or driver on the day of the tour
                  </p>
                </div>
              </div>
            </Card>
          </label>
        </div>

        <div className="flex items-center space-x-3 cursor-pointer group">
          <RadioGroupItem value="FULL" id="full" className="cursor-pointer" />
          <label htmlFor="full" className="flex-1 cursor-pointer">
            <Card
              className={`p-4 transition-all hover:border-primary ${
                value === "FULL" ? "border-secondary bg-secondary/50" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <IndianRupee className="h-6 w-6 text-secondary shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Pay full</p>
                  <p className="text-sm text-muted-foreground">
                    Complete payment online in one step and get 10% off
                  </p>
                </div>
              </div>
            </Card>
          </label>
        </div>

        {/* <div className="flex items-center space-x-3 cursor-pointer group">
          <RadioGroupItem
            value="PARTIAL"
            id="partial"
            className="cursor-pointer"
          />
          <label htmlFor="partial" className="flex-1 cursor-pointer">
            <Card
              className={`p-4 transition-all hover:border-primary ${
                value === "PARTIAL" ? "border-secondary bg-secondary/50" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <Percent className="h-6 w-6 text-secondary shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground">
                      Pay 30% advance
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      Recommended
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Pay now and clear remaining amount later before tour start.
                  </p>
                </div>
              </div>
            </Card>
          </label>
        </div> */}
      </RadioGroup>
    </div>
  );
}
