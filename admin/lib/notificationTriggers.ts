import { useFCMNotification } from "@/contexts/FCMNotificationContext";

export const useNotificationTriggers = () => {
  const ctx = useFCMNotification();

  // 🔒 Safety (avoid crash if provider missing)
  if (!ctx) {
    console.warn("FCMNotificationContext not found");
    return {
      onBookingCreated: () => {},
      onPaymentSuccess: () => {},
      onPaymentFailed: () => {},
      onBookingAccepted: () => {},
      onBookingRejected: () => {},
      onBookingCompleted: () => {},
      onGenericUpdate: () => {},
    };
  }

  const { showSuccess, showError, showInfo } = ctx;

  const onBookingCreated = (bookingId: string, bookingType: string) => {
    showSuccess(
      `Your ${bookingType.toLowerCase()} booking created successfully`,
      "Booking Created"
    );
  };

  const onPaymentSuccess = (amount: number, bookingId: string) => {
    showSuccess(
      `₹${amount} payment received`,
      "Payment Successful"
    );
  };

  const onPaymentFailed = (error: string) => {
    showError(
      `Payment failed: ${error}`,
      "Payment Failed"
    );
  };

  const onBookingAccepted = (providerName: string) => {
    showSuccess(
      `${providerName} accepted your booking`,
      "Booking Accepted"
    );
  };

  const onBookingRejected = (reason?: string) => {
    showError(
      `Booking rejected${reason ? `: ${reason}` : ""}`,
      "Booking Rejected"
    );
  };

  const onBookingCompleted = () => {
    showSuccess(
      "Booking completed. Please leave a review",
      "Booking Completed"
    );
  };

  const onGenericUpdate = (
    title: string,
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    if (type === "success") showSuccess(message, title);
    else if (type === "error") showError(message, title);
    else showInfo(message, title);
  };

  return {
    onBookingCreated,
    onPaymentSuccess,
    onPaymentFailed,
    onBookingAccepted,
    onBookingRejected,
    onBookingCompleted,
    onGenericUpdate,
  };
};