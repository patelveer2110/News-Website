// App.jsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

// Pages
import Login from './pages/Login';
import UserHome from './pages/UserHome';
import AdminHome from "./pages/AdminHome";
import Post from "./pages/Post";
import TagPage from "./pages/TagPage";
import NotFound from './pages/404';
import AdminProfilePage from "./pages/AdminProfile";
import CreatePost from "./pages/CreatePost";
import AdminPosts from "./pages/AdminPosts";
import ReportPage from "./pages/ReportPage";

// Components
import AdminNavbar from './components/AdminNavbar';
import UserNavbar from './components/UserNavbar';
import AdminListPage from "./pages/AdminListPage";

export const backendURL = "http://localhost:5000";

// Token expiry check utility;

// Layout wrapper for navbar
const Layout = ({ children }) => {
  const location = useLocation();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token"));
      setRole(localStorage.getItem("role"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const showNavbar = location.pathname !== "/login";

  return (
    <>
      {showNavbar && token && role === "admin" && <AdminNavbar />}
      {showNavbar && role !== "user" && <UserNavbar />}
      {children}
    </>
  );
};

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/user/dashboard" />} />
        <Route path="/admin/dashboard" element={<AdminHome />} />
        <Route path="/admin/create" element={<CreatePost />} />
        <Route path="/admin/post" element={<AdminPosts />} />
        <Route path="/admin/reports" element={<ReportPage />} />
        <Route path="/user/dashboard" element={<UserHome />} />
        <Route path="/post/:id" element={<Post />} />
        <Route path="/tag/:tag" element={<TagPage />} />
        <Route path="/admin/profile/:adminId" element={<AdminProfilePage />} />
          <Route path="/admin/profile-search/:query" element={<AdminListPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

export default App;
