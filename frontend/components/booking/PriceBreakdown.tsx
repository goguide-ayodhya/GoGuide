interface PriceBreakdownProps {
  items: { label: string; amount: number }[];
  total: number;
  paymentStatus?: string;
  remainingAmount?: number;
}

export function PriceBreakdown({
  items,
  total,
  paymentStatus,
  remainingAmount,
}: PriceBreakdownProps) {
  const isPartial = paymentStatus === "PARTIAL";

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={idx} className="flex justify-between text-sm">
          <span className="text-muted-foreground">{item.label}</span>
          <span className="text-foreground font-medium">₹{item.amount}</span>
        </div>
      ))}

      <div className="border-t pt-3 flex justify-between font-semibold">
        <span className="text-foreground">
          {isPartial ? "Remaining Amount" : "Total Amount"}
        </span>

        <span className="text-secondary text-lg">
          ₹{isPartial ? remainingAmount : total}
        </span>
      </div>
    </div>
  );
}
