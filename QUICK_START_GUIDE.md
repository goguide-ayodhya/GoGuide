# Admin Commission & Driver Earnings - QUICK START GUIDE

## For Admins

### 1. Set Commission Rate (First Time Setup)
```
1. Log in as Admin
2. Navigate to: Admin → Settings → Financial Settings
3. Click "Edit Commission Percentage"
4. Enter percentage (0-100)
   - Example: 20 for 20%
5. Review warning message
6. Wait for 10-second countdown
7. Click "Confirm Change"
✓ Commission is now active for all new earnings
```

### 2. Record Driver Payments (Daily/Weekly)
```
1. Go to: Admin → Driver Collections
2. View summary cards:
   - Total Commission Generated: ₹[X]
   - Already Collected: ₹[Y]
   - Pending Collection: ₹[Z]
3. Find driver in table (or search)
4. Click "Add Payment" button
5. Enter amount received
6. Add optional note (e.g., "Bank Transfer")
7. Click "Record Payment"
✓ Payment recorded with PENDING status
8. Click "Confirm" to finalize
✓ Amount deducted from driver's pending balance
```

### 3. View Collection Status
```
1. Go to: Admin → Driver Collections
2. See all drivers with:
   - Total earned
   - Total commission owed
   - Amount already paid
   - Pending amount
3. Click on driver for more details
```

---

## For Drivers

### 1. View Your Earnings & Commission
```
1. Log in as Driver
2. Navigate to: Driver → Payments
3. See two cards:
   
   Card 1: Total Earnings
   - Shows total earned from all rides
   
   Card 2: Commission Breakdown
   - Total Commission Generated (what you owe)
   - Already Paid to Admin
   - Pending Payment (what you still owe)
4. See example in explanation card
```

### 2. Understand Commission Calculation
```
Example: You earn ₹1000 with 20% commission
- Your Earnings: ₹1000
- Admin Commission (20%): -₹200
- You Receive: ₹800

The commission % is set by admin and applies to ALL your earnings.
```

### 3. Track Payment History
```
1. On Payments page, scroll down to "Payment History"
2. See all payments with:
   - Amount
   - Status (PENDING/CONFIRMED)
   - Payment date
   - Recorded by which admin
   - Optional notes
```

---

## Example Scenarios

### Scenario 1: New Driver, First Earnings
```
Admin action:
1. Driver completes 5 rides earning ₹1000 total
2. System calculates commission: ₹200 (20%)
3. Driver wallet shows:
   - Total Earned: ₹1000
   - Admin Commission: ₹200
   - Pending Payment: ₹200

Driver action:
1. Goes to Payments page
2. Sees he owes admin ₹200
3. Pays admin cash
4. Admin records ₹200 payment + confirms
5. Driver payment history shows confirmed payment
6. Pending balance now: ₹0
```

### Scenario 2: Commission Rate Change
```
Admin action:
1. Goes to Financial Settings
2. Changes commission from 20% to 25%
3. Waits 10 seconds and confirms

Effect:
- Old earnings: Still calculated at 20%
- New earnings: Calculated at 25%
- Drivers see updated commission % on new transactions
```

### Scenario 3: Large Payment Collection
```
Admin action:
1. Driver has pending ₹5000
2. Driver pays ₹2000
3. Admin goes to Collections page
4. Finds driver, clicks "Add Payment"
5. Enters ₹2000, note "Partial payment"
6. Confirms payment
7. Driver wallet updated:
   - Pending now: ₹3000
   - Paid today: ₹2000
```

---

## Key Numbers to Remember

### All Amounts Are Rounded (No Decimals)
```
✓ ₹1000 (correct)
✗ ₹1000.50 (not allowed)

System uses Math.round() for all calculations
```

### Example Calculations
```
Commission Percent: 20%

Driver Earnings → Admin Share → Driver Keeps
₹100 → ₹20 → ₹80
₹500 → ₹100 → ₹400
₹1000 → ₹200 → ₹800
₹2500 → ₹500 → ₹2000
```

---

## Troubleshooting

### Problem: Commission % won't update
**Solution:**
- Ensure 10-second countdown timer completed
- Check that you have ADMIN role
- Try refreshing page after save

### Problem: Payment amount rejected
**Solution:**
- Ensure amount ≤ pending amount
- Check amount is whole number (no decimals)
- Verify driver wallet has pending balance

### Problem: Driver can't see payment history
**Solution:**
- Ensure admin confirmed the payment
- Wait a few seconds for page refresh
- Try logging out and back in
- Check driver has payments recorded

### Problem: Commission not appearing on earnings
**Solution:**
- Ensure AdminSettings commission % is > 0
- Verify ride payment status is COMPLETED
- Check driver wallet exists (auto-created)
- Review backend logs for errors

---

## Important Rules

### ✅ DO THIS
- Record payments with clear notes
- Round all amounts (no decimals)
- Wait countdown before confirming commission changes
- Review pending amounts weekly
- Confirm payments after receiving from driver

### ❌ DON'T DO THIS
- Try to record payments > pending amount
- Change commission too frequently
- Record payments without driver consent
- Edit confirmed payment records
- Ignore payment confirmation step

---

## API Reference (For Developers)

### Get Current Settings
```
GET /api/finance/settings
Returns: { driverCommissionPercent: 20, ... }
```

### Record Payment
```
POST /api/finance/commission/record
Body: { driverId, amount, note }
Returns: { _id, status: "PENDING", ... }
```

### Confirm Payment
```
PATCH /api/finance/commission/:paymentId/confirm
Returns: { success: true }
```

### Get Driver Wallet
```
GET /api/finance/driver/:driverId/wallet
Returns: { totalEarned, pendingAdminCommission, ... }
```

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review FINANCIAL_SYSTEM_DOCUMENTATION.md for detailed info
3. Check backend logs: `backend/src/server.ts`
4. Verify database connection: MongoDB Atlas

---

**System deployed and ready for use!**
Last updated: May 2026
