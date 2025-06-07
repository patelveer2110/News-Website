// src/hooks/useAuth.js
import { isTokenExpired, logoutUser } from "../utils/auth";

export const adminAuth = () => {
  const token = localStorage.getItem("token");

  if (!token || isTokenExpired(token)) {
    logoutUser();
    return null;
  }
    const adminId = JSON.parse(atob(token.split('.')[1])).id; // Decode JWT to get user ID

  return { token, adminId };
};
