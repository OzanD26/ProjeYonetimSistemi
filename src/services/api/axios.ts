import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

console.log("[ENV] VITE_API_URL =", baseURL);

export const api = axios.create({
  baseURL,
  timeout: 15000,
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    // Hatanın kök nedenini konsolda net görelim
    console.error("[API ERROR]", {
      baseURL,
      url: err.config?.url,
      full: `${baseURL || "(no base)" }${err.config?.url || ""}`,
      message: err.message,
      status: err.response?.status,
      data: err.response?.data,
    });
    return Promise.reject(err);
  }
);
