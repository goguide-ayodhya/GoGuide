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
      {items.map((item, idx) => {
        const isGst = String(item.label).toLowerCase().includes("gst");
        return (
          <div
            key={idx}
            className={`${isGst ? "hidden md:flex" : "flex"} justify-between text-sm`}
          >
            <span className="text-muted-foreground">{item.label}</span>
            <span className="text-foreground font-medium">
              {item.amount < 0 ? "-" : ""}₹{Math.abs(item.amount).toLocaleString("en-IN")}
            </span>
          </div>
        );
      })}

      <div className="border-t pt-3 flex justify-between font-semibold">
        <span className="text-foreground">
          {isPartial ? "Remaining Amount" : "Total Amount"}
        </span>

        <span className="text-secondary text-lg">
          ₹{(isPartial ? (remainingAmount ?? 0) : (total ?? 0)).toLocaleString("en-IN")}
        </span>
      </div>
    </div>
  );
}
