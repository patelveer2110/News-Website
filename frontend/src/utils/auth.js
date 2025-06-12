// utils/auth.js
export const isTokenExpired = (token) => {
  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    const exp = decoded.exp * 1000; // convert to ms
    return Date.now() > exp;
  } catch {
    return true;
  }
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  // window.location.href = "/login"; // or use react-router navigation
};
