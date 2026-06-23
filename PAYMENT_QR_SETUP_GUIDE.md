# Payment QR Code Setup & Testing Guide

## Overview
The Payment QR Code system allows guides to display a payment QR code on their dashboard. This guide covers:
1. How to enable/disable the payment QR feature in admin settings
2. How to configure payment details
3. How to verify it shows on the guide dashboard

---

## Step 1: Admin Setup

### Access Admin Settings
1. Navigate to: `http://localhost:3000/admin` (or your admin URL)
2. Go to **Settings** (left sidebar or main menu)
3. Scroll down to **"Payment QR Code Settings"** section

### Configure Payment QR

You'll see this section:
```
Enable Payment QR Code
├─ Toggle buttons: "Enable" and "Disable"
├─ QR Code Image URL (text input)
├─ UPI ID (text input)  
├─ Merchant Name (text input)
└─ Live Preview (shows your QR image)
```

**Fill in the fields:**

| Field | Example Value | Notes |
|-------|---------------|-------|
| **QR Code Image URL** | `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=merchant@upi` | Can be uploaded or external URL |
| **UPI ID** | `merchant@upi` or `9876543210@okaxis` | Displayed to guides for payment |
| **Merchant Name** | `GoGuide Travels` | Shown in the payment modal |

### Enable the Feature

Click the **"Enable"** button (it should turn green and show "Enabled" badge)

### Save Settings

Click **"Save Payment QR Settings"** button at the bottom

**Expected:** Alert shows "Payment QR Settings updated successfully!"

---

## Step 2: Verify Backend Data

Open your browser's developer console and check:

```javascript
// Run this in browser console after admin saves
fetch('http://localhost:5000/api/finance/settings/public')
  .then(res => res.json())
  .then(data => console.log('Payment QR:', data.data.paymentQR))
```

**Expected output:**
```javascript
{
  url: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=merchant@upi",
  isEnabled: true,
  upiId: "merchant@upi",
  merchantName: "GoGuide Travels"
}
```

If `isEnabled: false` or fields are missing, the button won't show on guide dashboard.

---

## Step 3: Verify Guide Dashboard

### Login as Guide
1. Logout from admin
2. Login as a Guide user
3. Navigate to **Guide Dashboard**

### Check Button Visibility
Look in the top-right area of the header (near "Show Payment QR" text)

**If enabled correctly, you should see:**
- ✅ A QR icon button that says "Show Payment QR"
- Located in the top-right of the page

**If button is NOT showing:**
- ❌ Payment QR is disabled in admin settings
- ❌ URL is empty
- ❌ Settings haven't been fetched yet (try page refresh)

### Click the Button
Click **"Show Payment QR"** button

**Expected modal to show:**
- ✅ QR code image (from the URL you configured)
- ✅ Merchant name (e.g., "GoGuide Travels")
- ✅ UPI ID with copy button (e.g., "merchant@upi")
- ✅ "Scan to Pay" text
- ✅ Close (X) button

### Test Copy Button
Click the copy button next to UPI ID

**Expected:**
- ✅ Icon changes to checkmark
- ✅ Text changes to "Copied!"
- ✅ UPI ID is copied to clipboard

---

## Step 4: Test Disable Feature

### Disable in Admin
1. Go back to Admin Settings
2. Click **"Disable"** button (should turn red and show "Disabled" badge)
3. Click **"Save Payment QR Settings"**

### Verify on Guide Dashboard
1. Go to Guide Dashboard
2. **Refresh the page**
3. **Expected:** "Show Payment QR" button should disappear

### Re-enable to Test
1. Admin: Click **"Enable"** and save
2. Guide Dashboard: **Refresh the page**
3. **Expected:** "Show Payment QR" button reappears

---

## Troubleshooting

### Button Not Showing

**Check 1: Is it enabled?**
```bash
# In MongoDB
db.adminsettings.findOne({}, { paymentQR: 1 })

# Look for:
{
  paymentQR: {
    isEnabled: true,  // Must be true
    url: "https://...",
    upiId: "...",
    merchantName: "..."
  }
}
```

**Check 2: Do you have both url AND isEnabled?**
```javascript
// In browser console while on guide dashboard
fetch('http://localhost:5000/api/finance/settings/public')
  .then(res => res.json())
  .then(data => {
    const qr = data.data.paymentQR;
    console.log('isEnabled:', qr?.isEnabled);
    console.log('url:', qr?.url);
  })
```

Both must be truthy for button to show.

**Check 3: Did you refresh the guide dashboard?**
- The page fetches settings on load
- Changes made in admin won't show until you refresh

### QR Image Not Loading in Modal

**Issue:** Shows placeholder "Invalid Image URL"

**Solution:**
1. Verify the URL is accessible (try in browser)
2. Check CORS settings if using external URL
3. Make sure image URL is HTTPS

### Modal Not Showing
1. Verify button is visible first
2. Click button and check browser console for errors
3. Ensure modal component is imported correctly

---

## API Details

### Get Public Settings
```bash
curl http://localhost:5000/api/finance/settings/public
```

Returns:
```json
{
  "success": true,
  "data": {
    "driverCommissionPercent": 20,
    "guidePricing": { ... },
    "locations": [ ... ],
    "paymentQR": {
      "url": "https://...",
      "isEnabled": true,
      "upiId": "merchant@upi",
      "merchantName": "GoGuide Travels"
    }
  }
}
```

### Update Payment QR
```bash
curl -X PATCH http://localhost:5000/api/finance/settings/payment-qr \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://...",
    "isEnabled": true,
    "upiId": "merchant@upi",
    "merchantName": "GoGuide Travels"
  }'
```

---

## Quick Checklist

Before testing, verify:
- [ ] Admin dashboard is accessible
- [ ] Can navigate to Settings page
- [ ] "Payment QR Code Settings" section visible
- [ ] Enable/Disable buttons are clickable
- [ ] Can type in UPI ID and Merchant Name fields
- [ ] Can see QR image preview
- [ ] Save button works without errors

After admin setup:
- [ ] Backend returns full paymentQR object
- [ ] Guide dashboard shows "Show Payment QR" button
- [ ] Modal opens when button clicked
- [ ] Modal shows all details (QR, UPI, merchant)
- [ ] Copy button works
- [ ] Disable hides button, enable shows it

---

## Common Setup Values

Use these if you need quick test data:

```
QR URL: https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=test@upi
UPI ID: test@upi
Merchant Name: Test Merchant
```

Or for a specific UPI:
```
QR URL: https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=9876543210@okaxis&pn=GoGuide
UPI ID: 9876543210@okaxis
Merchant Name: GoGuide Travels
```
