const base_url = process.env.NEXT_PUBLIC_BASE_URL;
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};


export const createPaymentApi = async (bookingId: string) => {
  const res = await fetch(`${base_url}payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return res.json();
};

export const processPaymentApi = async (paymentId: string) => {
  const res = await fetch(`${base_url}payment/process`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status: "COMPLETED",
      paymentMethod: "CARD",
      transactionId: "txn_" + Date.now(),
    }),
  });

  return res.json();
};

export const getMyPaymentsApi = async () => {
  const res = await fetch(`${base_url}payments/my-payments`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return res.json();
};

export const getGuidePaymentsApi = async (guideId: string) => {
  const res = await fetch(`${base_url}payments/guide/${guideId}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return res.json();
};

export const getPaymentStatsApi = async (guideId: string) => {
  const res = await fetch(`${base_url}payments/guide/${guideId}/stats`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return res.json();
};

export const getGuideEarnings = async () => {
  const res = await fetch(`${base_url}payment/guide/earnings`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return res.json();
};
