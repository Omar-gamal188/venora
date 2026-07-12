import axios from "axios";

export const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:5000";

// The backend now requires authentication for admin actions (product
// create/update/delete). Attach the stored session token to every request
// that targets our API — and only our API — so existing pages keep working
// without any component changes. Third-party calls (nominatim, fakestore)
// are untouched.
const TOKEN_KEY = "venora_auth_token";

axios.interceptors.request.use((config) => {
  const url = config.url || "";
  const isApiRequest =
    url.startsWith(`${API_BASE}/`) || url === API_BASE || url.startsWith("/api/");
  if (isApiRequest && !config.headers?.Authorization) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
