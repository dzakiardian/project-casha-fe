// ✅ Untuk Client Component — hit API Route Next.js, bukan backend langsung

type FetchOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

export async function clientFetch(
  endpoint: string,
  options: FetchOptions = {},
) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URI}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Terjadi kesalahan");

  return json;
}