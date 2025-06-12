import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminAuth } from "../hooks/adminAuth";
import { backendURL } from "../App";
import {
  LayoutDashboard,
  FileText,
  Flag,
  User,
  Settings,
} from "lucide-react";

const AdminSidebar = () => {
  const { adminId, token } = adminAuth();
  const [admin, setAdmin] = useState({
    name: "Admin",
    email: "admin@example.com",
    profileImage: "",
  });

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await fetch(`${backendURL}/api/admin/profile/${adminId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setAdmin({
            name: data.username || "Admin",
            email: data.email || "admin@example.com",
            profileImage: data.profileImage || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch admin data", err);
      }
    };

    if (adminId && token) fetchAdminData();
  }, [adminId, token]);

  const navLinks = [
    { to: "/admin/dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { to: "/admin/post", icon: <FileText size={20} />, label: "Posts" },
    { to: "/admin/reports", icon: <Flag size={20} />, label: "Reports" },
    { to: `/admin/profile/${adminId}`, icon: <User size={20} />, label: "Profile" },
  ];

  const handleNavClick = () => {
    const drawerCheckbox = document.getElementById("admin-drawer");
    if (drawerCheckbox) drawerCheckbox.checked = false;
  };

  return (
    <div className="drawer-side z-50">
      <label htmlFor="admin-drawer" className="drawer-overlay lg:hidden"></label>
      <aside className="w-64 bg-base-300 h-full p-4 border-r pt-16">
        {/* Logo */}
        {/* <div className="flex items-center mb-6">
          <Link to="/admin/dashboard" className="text-xl font-bold text-base-content">
            AdminPanel
          </Link>
        </div> */}

        {/* Admin Info */}
        <div className="flex flex-col items-center mb-6 text-center">
          <img
            className="w-20 h-20 rounded-full object-cover"
            src={admin.profileImage || "https://via.placeholder.com/150"}
            alt="Admin"
          />
          <h4 className="mt-2 text-lg font-semibold truncate max-w-[180px]">
            {admin.name}
          </h4>
          <p className="text-sm text-gray-500 truncate max-w-[180px]">
            {admin.email}
          </p>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navLinks.map(({ to, icon, label }) => (
            <Link
              key={label}
              to={to}
              onClick={handleNavClick}
              className="flex items-center px-4 py-2 rounded-lg hover:bg-base-300 text-base-content"
            >
              <span className="mr-3">{icon}</span> {label}
            </Link>
          ))}
        </nav>
      </aside>
    </div>
  );
};

export default AdminSidebar;
