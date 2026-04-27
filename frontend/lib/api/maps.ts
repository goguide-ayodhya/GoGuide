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
    console.log("[API] Adding Authorization header, token length:", token.length);
  } else {
    console.warn("[API] No token found for request");
  }
  return headers;
};

const handleRes = async (res: Response) => {
  const json = await res.json();
  if (!res.ok) {
    const error = new Error(json.message || "API error");
    (error as any).errors = json.errors;
    throw error;
  }
  return json.data;
};

export const getSuggestions = async (input: string) => {
  try {
    const response = await fetch(`${base_url}/maps/get-suggestions?input=${encodeURIComponent(input)}`, {
      headers: authHeaders(),
    });
    return handleRes(response);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    throw error;
  }
};

export type Suggestion = string;
