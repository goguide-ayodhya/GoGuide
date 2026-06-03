About GST

// frontend -------------------
1. In PaymentConfirmation ==> const taxPercentage = 0;
2. PackageBookingForm ==> const GST_RATE = 0.0; 
3. app/tourist/payment/page.tsx ==> gstAmount = Math.round(afterDiscount * 0.0);
4. frontend/components/booking/PackageBookingForm.tsx ==> <span className="text-slate-600">GST (0%)</span>
5. frontend/components/cabs/PaymentSuccess.tsx ==> const taxPercentage = 0;



// backend -------------------
1. backend/src/utils/bookingPricing.ts ==> const GST_RATE = PRICING_CONFIG.GST_RATE;