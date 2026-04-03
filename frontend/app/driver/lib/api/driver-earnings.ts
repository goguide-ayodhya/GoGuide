const base_url = process.env.NEXT_PUBLIC_BASE_URL;
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

export const getDriverEarnings = async () => {
  const res = await fetch(`${base_url}payment/driver/earnings`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return res.json();
};
