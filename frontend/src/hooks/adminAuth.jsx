// src/hooks/useAuth.js
import { isTokenExpired, logoutUser } from "../utils/auth";

export const adminAuth = () => {
  const token = localStorage.getItem("token");

  if (!token || isTokenExpired(token)) {
    logoutUser();
    window.location.href = '/login'; // Redirect to admin login if token is invalid or expired
    return null;
  }
    const adminId = JSON.parse(atob(token.split('.')[1])).id; // Decode JWT to get user ID

  return { token, adminId };
};
