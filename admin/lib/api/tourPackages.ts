const base_url = process.env.NEXT_PUBLIC_BASE_URL;

export const getPackages = async () => {
  const res = await fetch(`${base_url}packages`);
  return res.json();
};

export const getPackageById = async (id: string) => {
  const res = await fetch(`${base_url}packages/${id}`);
  return res.json();
};
