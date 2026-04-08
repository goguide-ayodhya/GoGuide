const base_url = process.env.NEXT_PUBLIC_BASE_URL;

export const getPasses = async () => {
  const res = await fetch(`${base_url}passes`);
  return res.json();
};

export const getPassById = async (id: string) => {
  const res = await fetch(`${base_url}passes/${id}`);
  return res.json();
};