const LARAVEL_APP_URL =
  import.meta.env.VITE_LARAVEL_APP_URL || "http://localhost:8000";
const API_URL = `${LARAVEL_APP_URL}/api`;

export { LARAVEL_APP_URL, API_URL };
