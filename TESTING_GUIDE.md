# Guide Review QR & Payment QR - Debugging & Verification Steps

## BEFORE Testing - Run Migration

The review QR system requires existing guides to have `reviewQRToken` values. Run this migration:

```bash
cd backend
npm run ts-node scripts/migrate-review-qr.ts
```

This will:
- Generate unique `reviewQRToken` for all guides
- Generate QR code images
- Set `reviewCollectionEnabled = true`

**Verify migration worked:**
```bash
# In Node/MongoDB shell
db.guides.findOne({ reviewQRToken: { $exists: true } })
```

Should show guides with UUID tokens like `"550e8400-e29b-41d4-a716-446655440000"`

---

## ISSUE 1: Public Review QR Page - Testing

### Step 1: Verify Backend API
```bash
# Get a guide's token (after migration)
db.guides.findOne({}, { reviewQRToken: 1, userId: 1 })
# Example: reviewQRToken: "abc123-def456-ghi789"

# Test the API endpoint directly
curl "http://localhost:5000/api/review-qr/token/abc123-def456-ghi789"

# Should return:
{
  "success": true,
  "data": {
    "userId": { "name": "Guide Name", "avatar": "..." },
    "averageRating": 0,
    "totalReviews": 0,
    "reviewCollectionEnabled": true,
    "reviewQRToken": "abc123-def456-ghi789"
  }
}
```

### Step 2: Test Frontend Page
- Navigate to: `http://localhost:3000/tourist/guides/review/abc123-def456-ghi789`
- **Expected to see:**
  - ✅ Guide avatar (circular image)
  - ✅ Guide name
  - ✅ "GoGuide · Ayodhya" text
  - ✅ "How was your experience?" heading
  - ✅ 5 star buttons (clickable, change color when selected)
  - ✅ "Your Name" input field (optional)
  - ✅ "Comments" textarea (optional)
  - ✅ "Submit Review" button (disabled until star is selected)

### Step 3: Test Review Submission
1. Click a star rating (e.g., 4 stars)
2. Optionally enter name "Rahul Sharma"
3. Optionally enter comment "Great guide!"
4. Click "Submit Review"
5. **Expected:**
   - ✅ Button shows "Submitting..."
   - ✅ After success: "Thank You!" message appears
   - ✅ Backend review is saved (check database)
   - ✅ Guide's rating is updated

**Verify in database:**
```bash
db.reviews.findOne({ isQRReview: true })
# Should show the submitted review with correct rating, comments, etc.

db.guides.findOne({ _id: ObjectId("...") })
# Should show updated averageRating and totalReviews
```

### Step 4: Test Spam Prevention (24-hour rate limit)
1. Submit another review immediately from same device
2. **Expected:** Error message "You can only submit one review per guide every 24 hours. Please try again in 24 hours."
3. Change device/browser or wait, try again
4. **Expected:** Should be blocked again if same device fingerprint

---

## ISSUE 2: Payment QR Button - Testing

### Step 1: Setup Payment QR in Admin
1. Go to Admin Dashboard → Settings → Payment QR Code Settings
2. Fill in:
   - **Enable Payment QR Code:** Toggle ON
   - **QR Code Image URL:** `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=merchant@upi`
   - **UPI ID:** `merchant@upi` or `9876543210@okaxis`
   - **Merchant Name:** `GoGuide Travels`
3. Click "Save Payment QR Settings"
4. **Verify backend:**
   ```bash
   db.adminsettings.findOne({})
   # Should show paymentQR with all fields
   ```

### Step 2: Test Guide Dashboard Payment QR Button
1. Login as Guide
2. Go to Guide Dashboard
3. **Look in top-right corner near "Show Payment QR" text**
4. **Expected to see:**
   - ✅ QR Code icon (in the button)
   - ✅ "Show Payment QR" button visible
   - ✅ Button is NOT visible if payment QR is disabled

### Step 3: Test Payment QR Modal
1. Click "Show Payment QR" button
2. **Expected modal to show:**
   - ✅ QR code image (should load from the URL you set)
   - ✅ "Merchant Name" heading with value "GoGuide Travels"
   - ✅ "UPI ID" section showing `merchant@upi`
   - ✅ Copy button next to UPI ID
   - ✅ "Scan to Pay" text at bottom
   - ✅ Close (X) button in top-right

### Step 4: Test UPI Copy
1. Click the Copy button next to UPI ID
2. **Expected:**
   - ✅ Button icon changes to checkmark
   - ✅ Text changes to "Copied!"
   - ✅ UPI ID is copied to clipboard

### Step 5: Test Settings Propagation
1. Admin changes UPI ID to: `newmerchant@upi`
2. Admin clicks "Save Payment QR Settings"
3. Guide logs out and logs back in
4. Go to Guide Dashboard
5. Click "Show Payment QR" button
6. **Expected:** Modal shows updated UPI ID `newmerchant@upi`

---

## ISSUE 3: Tourist Price Removed - Verification

### Check Guide Dashboard
1. Login as Guide
2. Go to Dashboard
3. **Look at pricing section - should show ONLY:**

```
Half Day Package
├─ Your Earning ₹1000

Full Day Package
├─ Your Earning ₹1500
```

**Should NOT show:**
- ❌ "Tourist Price ₹2000"
- ❌ "Tourist Price ₹2500"

---

## Testing Checklist

Use this checklist to verify everything works:

### Public Review QR System
- [ ] Migration script runs without errors
- [ ] Guides have reviewQRToken after migration
- [ ] Backend API returns guide data for valid token
- [ ] Frontend page loads without "Guide not found" error
- [ ] All UI elements visible (avatar, name, stars, comment box)
- [ ] Star rating works (highlights on click)
- [ ] Review submission works
- [ ] Success message shows
- [ ] Review saved to database
- [ ] Spam prevention works (blocks within 24 hours)
- [ ] Different device can submit (after clearing cookies)

### Payment QR System
- [ ] Admin settings page loads
- [ ] Can enable Payment QR toggle
- [ ] Can enter QR URL
- [ ] Can enter UPI ID
- [ ] Can enter Merchant Name
- [ ] Settings save successfully
- [ ] Backend returns paymentQR in /api/finance/settings/public
- [ ] Guide dashboard shows "Show Payment QR" button
- [ ] Button only shows when enabled
- [ ] Modal opens on click
- [ ] Modal shows QR image
- [ ] Modal shows merchant name
- [ ] Modal shows UPI ID
- [ ] Copy button works
- [ ] Settings update propagates to guides

### Tourist Price Removed
- [ ] Half Day card shows ONLY "Your Earning"
- [ ] Full Day card shows ONLY "Your Earning"
- [ ] No "Tourist Price" text visible

---

## Common Issues & Solutions

### "Guide not found" on review page
**Cause:** Guide doesn't have reviewQRToken
**Solution:** Run migration script

### Payment QR button not showing
**Cause 1:** paymentQR not enabled in admin
**Solution:** Check Admin Settings → Payment QR → Toggle ON

**Cause 2:** paymentQR.url is empty
**Solution:** Enter a valid QR image URL in Admin Settings

**Cause 3:** Settings not fetched
**Solution:** Check browser console for API errors, check network tab

### Modal not showing merchant/UPI info
**Cause:** adminSettings document doesn't have these fields
**Solution:** Update via Admin Settings form and save

---

## API Endpoints to Test

```bash
# Get public settings (what guide dashboard fetches)
GET http://localhost:5000/api/finance/settings/public

# Should return:
{
  "success": true,
  "data": {
    "paymentQR": {
      "url": "https://...",
      "isEnabled": true,
      "upiId": "merchant@upi",
      "merchantName": "GoGuide Travels"
    },
    "guidePricing": { ... }
  }
}

# Get guide by review token
GET http://localhost:5000/api/review-qr/token/{token}

# Submit review
POST http://localhost:5000/api/review-qr/token/{token}/submit
Body: { "rating": 4, "comments": "Great!", "reviewerName": "John" }
```

---

## Final Verification

Only claim a feature is complete when:
1. ✅ Backend API returns correct data
2. ✅ Frontend page/component loads without errors
3. ✅ UI elements are visible and styled correctly
4. ✅ User interactions work (clicks, form submission)
5. ✅ Data is saved to database
6. ✅ Changes propagate across the system
