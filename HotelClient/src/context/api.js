import axios from "axios";
// ✅ Création d'une instance Axios
const api = axios.create({
  //baseURL: "http://127.0.0.1:8000/api",
  //baseUrlImage: "http://127.0.0.1:8000",
  baseURL: "http://192.168.1.110:8000/api",
  baseUrlImage: "http://192.168.1.110:8000",
});

// 🔹 Fonction pour rafraîchir le token
const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) throw new Error("No refresh token");

    const response = await axios.post("http://127.0.0.1:8000/api/token/refresh/", { refresh: refreshToken });

    const newAccessToken = response.data.access;
    localStorage.setItem("accessToken", newAccessToken);

    return newAccessToken;
  } catch (error) {
    console.error("Erreur lors du rafraîchissement du token", error);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.clear();
    return null;
  }
};

// ✅ Intercepter les requêtes et ajouter le token
api.interceptors.request.use(async (config) => {
  let token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Intercepter les réponses et gérer l'expiration du token
api.interceptors.response.use(
  (response) => response, // Retourner la réponse si tout va bien
  async (error) => {
    const originalRequest = error.config;
    
    // 🔹 Si le token a expiré (401) et qu'on n'a pas déjà tenté un refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newAccessToken = await refreshAccessToken();

      if (newAccessToken) {
        api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return api(originalRequest); // 🔄 Relancer la requête
      }
    }

    return Promise.reject(error);
  }
);

export default api;