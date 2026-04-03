const base_url = process.env.NEXT_PUBLIC_BASE_URL;
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

export const getDriverBookings = async (driverId: string) => {
  const res = await fetch(`${base_url}bookings/driver/${driverId}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const json = await res.json();
  return json.data;
};
