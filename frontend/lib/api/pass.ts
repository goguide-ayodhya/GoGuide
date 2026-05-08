import { handleApiResponse } from "./authErrorHandler";

const base_url = process.env.NEXT_PUBLIC_BASE_URL;

export const getPasses = async () => {
  const res = await fetch(`${base_url}passes`);
  // Check for auth errors and handle accordingly (401, expired tokens, etc.)
  return handleApiResponse(res);
};

export const getPassById = async (id: string) => {
  const res = await fetch(`${base_url}passes/${id}`);
  // Check for auth errors and handle accordingly (401, expired tokens, etc.)
  return handleApiResponse(res);
};