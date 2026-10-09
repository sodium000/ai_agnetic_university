import { ofetch } from "ofetch";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

const apiFetch = ofetch.create({
  baseURL: BASE_URL,
  credentials: "include",
});

export default apiFetch;
