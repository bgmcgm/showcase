export const csv = (s: string) => (s ? s.split(",").map((x) => x.trim()).filter(Boolean) : []);
