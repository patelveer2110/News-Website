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
import UserProfile from "./pages/UserProfile";

// Components
import AdminNavbar from './components/AdminNavbar';
import UserNavbar from './components/UserNavbar';
import AdminListPage from "./pages/AdminListPage";
import AdminSidebar from './components/AdminSidebar';
import EditProfile from "./pages/EditProfile";

export const backendURL = "http://localhost:5000";

// Layout wrapper
const Layout = ({ children, token, role }) => {
  const location = useLocation();

  const showNavbar = location.pathname !== "/login";

  // Access Control Logic
// Access Control Logic
const isAdminProfilePage = /^\/admin\/profile\/[^/]+$/.test(location.pathname);

if (!token && location.pathname.startsWith("/admin") && !isAdminProfilePage) {
  return <Navigate to="/login" replace />;
}

if (token && role === "admin" && location.pathname.startsWith("/user")) {
  return <Navigate to="/admin/dashboard" replace />;
}

if (token && role === "user" && location.pathname.startsWith("/admin") && !isAdminProfilePage) {
  return <Navigate to="/user/dashboard" replace />;
}


  return (
    <>
      {/* Admin Layout */}
      {showNavbar && token && role === "admin" && (
        <div className="drawer lg:drawer-open">
          <input id="admin-drawer" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content flex flex-col min-h-screen">
            <AdminNavbar />
            <main className="p-4">{children}</main>
          </div>
          <AdminSidebar />
        </div>
      )}

      {/* User Layout */}
      {showNavbar && (!token || role === "user") && (
        <>
          <UserNavbar />
          <main className="p-4 min-h-screen">{children}</main>
        </>
      )}

      {/* No Navbar Layout (Login) */}
      {!showNavbar && <main>{children}</main>}
    </>
  );
};

function App() {
  // Central auth state, initialized from localStorage once
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));

  // Sync localStorage when state changes
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  useEffect(() => {
    if (role) {
      localStorage.setItem("role", role);
    } else {
      localStorage.removeItem("role");
    }
  }, [role]);

  return (
    <Layout token={token} role={role}>
      <Routes>
        <Route
          path="/login"
          element={<Login setToken={setToken} setRole={setRole} />}
        />
        <Route path="/" element={<Navigate to="/user/dashboard" />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminHome />} />
        <Route path="/admin/create" element={<CreatePost />} />
        <Route path="/admin/post" element={<AdminPosts />} />
        <Route path="/admin/reports" element={<ReportPage />} />
        <Route path="/admin/profile/:adminId" element={<AdminProfilePage />} />

        {/* User Routes (Guest + Authenticated) */}
        <Route path="/edit-profile/:id" element={<EditProfile />} />
        <Route path="/user/dashboard" element={<UserHome />} />
        <Route path="/post/:id" element={<Post />} />
        <Route path="/tag/:tag" element={<TagPage />} />
        <Route path="/user/profile/:userId" element={<UserProfile />} />
        <Route path="/profile-search/:query" element={<AdminListPage />} />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

export default App;
