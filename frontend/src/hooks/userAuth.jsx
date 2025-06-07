// src/hooks/useAuth.js
import { isTokenExpired, logoutUser } from "../utils/auth";

export const userAuth = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || isTokenExpired(token)) {

    return null;
  }
    const userId = JSON.parse(atob(token.split('.')[1])).id; // Decode JWT to get user ID

  return { token, userId,role };
};
