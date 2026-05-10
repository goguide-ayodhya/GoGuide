export const defaultSettings = {
  platformCommission: 10,
  cancellationPolicy: "Free cancellation up to 24 hours before the booking. 50% refund for cancellations within 24 hours. No refund for cancellations within 2 hours of the booking time.",
  notificationEmail: true,
  notificationSms: false,
  notificationPush: true,
  securityTwoFactor: false,
  securitySessionTimeout: 30,
  ridePricing: {
    baseFare: {
      auto: 30,
      car: 50,
      moto: 20
    },
    perKmRate: {
      auto: 10,
      car: 15,
      moto: 8
    },
    perMinuteRate: {
      auto: 2,
      car: 3,
      moto: 1.5
    }
  }
};