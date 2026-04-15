const base_url = process.env.NEXT_PUBLIC_BASE_URL;

export const saveFCMTokenToBackend = async (token: string) => {
  try {
    const authToken = localStorage.getItem("token");
    if (!authToken) return;

    const response = await fetch(`${base_url}notifications/save-fcm-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ fcmToken: token }),
    });

    if (!response.ok) {
      throw new Error("Failed to save FCM token");
    }
  } catch (error) {
    console.warn("Error saving FCM token to backend:", error);
  }
};
