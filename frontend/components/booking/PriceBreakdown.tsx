interface PriceBreakdownProps {
  items: { label: string; amount: number | string }[];
  total: number;
  paymentStatus?: string;
  remainingAmount?: number;
  fullPaymentDiscountEligible?: boolean;
}

export function PriceBreakdown({
  items,
  total,
  paymentStatus,
  remainingAmount,
  fullPaymentDiscountEligible = true,
}: PriceBreakdownProps) {
  const isPartial = paymentStatus === "PARTIAL";

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={idx} className="flex justify-between items-center text-sm">
          <span className="text-slate-600">{item.label}</span>
          <span
            className={`font-medium ${typeof item.amount === "number" && item.amount < 0 ? "text-red-600" : "text-slate-900"}`}
          >
            {typeof item.amount === "string" ? item.amount : (item.amount < 0 ? "-" : "") + "₹" + Math.abs(item.amount).toLocaleString("en-IN")}
          </span>
        </div>
      ))}

      <div className="border-t pt-3 flex justify-between font-semibold">
        <span className="text-slate-900">
          {isPartial ? "Remaining Amount" : "Total Amount"}
        </span>

        <span className="text-slate-950 text-lg">
          ₹{(isPartial ? (remainingAmount ?? 0) : (total ?? 0)).toLocaleString("en-IN")}
        </span>
      </div>
    </div>
  );
}
