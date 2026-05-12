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
