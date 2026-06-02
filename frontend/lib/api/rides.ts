import { handleApiResponse } from "./authErrorHandler";
import { RideData } from "@/types/ride";

const base_url = process.env.NEXT_PUBLIC_BASE_URL;

const getToken = () => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token || token === "null" || token === "undefined") return null;
  return token;
};

const authHeaders = () => {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    console.log(
      "[API] Adding Authorization header, token length:",
      token.length,
    );
  } else {
    console.warn("[API] No token found for request");
  }
  return headers;
};

const handleRes = async (res: Response) => {
  // Use centralized auth error handler that checks for 401, token expiry, etc.
  return handleApiResponse(res);
};

export const getFare = async (pickup: string, destination: string) => {
  try {
    const url = new URL(`${base_url}rides/get-fare`);
    url.searchParams.append('pickup', pickup);
    url.searchParams.append('destination', destination);
    
    const response = await fetch(url.toString(), {
      headers: { ...authHeaders() },
    });
    return handleApiResponse(response);
  } catch (error) {
    console.error("Error fetching fare:", error);
    throw error;
  }
};

export const createRide = async (rideData: RideData) => {
  try {
    const response = await fetch(`${base_url}rides/create`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(rideData),
    });
    return handleApiResponse(response);
  } catch (error) {
    console.error("Error creating ride:", error);
    throw error;
  }
};

export const getPendingRides = async () => {
  try {
    const response = await fetch(`${base_url}rides/pending-rides`, {
      method: "GET",
      headers: { ...authHeaders() },
    });
    return handleApiResponse(response);
  } catch (error) {
    console.error("Error fetching pending rides:", error);
    throw error;
  }
};

export const confirmRide = async (rideId: string) => {
  try {
    const response = await fetch(`${base_url}rides/confirm`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ rideId }),
    });
    return handleApiResponse(response);
  } catch (error) {
    console.error("Error confirming ride:", error);
    throw error;
  }
};

export const startRide = async (rideId: string, otp: string) => {
  try {
    const response = await fetch(`${base_url}rides/start-ride?rideId=${rideId}&otp=${otp}`, {
      method: "GET",
      headers: { ...authHeaders() },
    });
    return handleApiResponse(response);
  } catch (error) {
    console.error("Error starting ride:", error);
    throw error;
  }
};

export const endRide = async (rideId: string) => {
  try {
    const response = await fetch(`${base_url}rides/end-ride`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ rideId }),
    });
    return handleApiResponse(response);
  } catch (error) {
    console.error("Error ending ride:", error);
    throw error;
  }
};

export const confirmPayment = async (rideId: string, paymentMethod: "cash" | "card" | "wallet") => {
  try {
    const response = await fetch(`${base_url}rides/confirm-payment`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ rideId, paymentMethod }),
    });
    return handleApiResponse(response);
  } catch (error) {
    console.error("Error confirming payment:", error);
    throw error;
  }
};

export const getActiveRide = async () => {
  try {
    console.log("[API] Fetching active ride...");
    const response = await fetch(`${base_url}rides/active`, {
      method: "GET",
      headers: { ...authHeaders() },
    });
    const data = await handleApiResponse(response);
    console.log("[API] Active ride response:", data);
    return data;
  } catch (error) {
    console.error("[API] Error fetching active ride:", error);
    throw error;
  }
};

export const submitReview = async (
  rideId: string,
  rating: number,
  text: string = "",
  skip: boolean = false
) => {
  try {
    console.log("[REVIEW_FLOW] Submitting review via API:", { rideId, rating, textLength: text.length, skip });
    const response = await fetch(`${base_url}rides/submit-review`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ rideId, rating, text, skip }),
    });
    const data = await handleApiResponse(response);
    console.log("[REVIEW_FLOW] Review submission response:", data);
    return data;
  } catch (error) {
    console.error("[REVIEW_FLOW] Error submitting review:", error);
    throw error;
  }
};

// [CANCEL_FLOW] Cancel ride — only allowed in pending/accepted status
export const cancelRide = async (rideId: string) => {
  try {
    console.log("[CANCEL_FLOW] Cancelling ride via API:", rideId);
    const response = await fetch(`${base_url}rides/cancel`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ rideId }),
    });
    const data = await handleApiResponse(response);
    console.log("[CANCEL_FLOW] Cancel response:", data);
    return data;
  } catch (error) {
    console.error("[CANCEL_FLOW] Error cancelling ride:", error);
    throw error;
  }
};

