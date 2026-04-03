interface PriceBreakdownProps {
  items: Array<{
    label: string
    amount: number
  }>
  total: number
}

export function PriceBreakdown({ items, total }: PriceBreakdownProps) {
  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={idx} className="flex justify-between text-sm">
          <span className="text-muted-foreground">{item.label}</span>
          <span className="text-foreground font-medium">₹{item.amount}</span>
        </div>
      ))}

      <div className="border-t pt-3 flex justify-between font-semibold">
        <span className="text-foreground">Total Amount</span>
        <span className="text-secondary text-lg">₹{total}</span>
      </div>
    </div>
  )
}
