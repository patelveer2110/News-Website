import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { adminAuth } from "../hooks/adminAuth";
import { ThemeContext } from "../context/ThemeContext";
import { Sun, Moon, Menu } from "lucide-react";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const { toggleTheme, theme } = useContext(ThemeContext);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="navbar bg-base-300 shadow-sm px-4 flex justify-between items-center">
  <div className="flex-none lg:hidden">
    <label htmlFor="admin-drawer" className="btn btn-square btn-ghost">
      <Menu className="w-6 h-6" />
    </label>
  </div>

  <div className="flex-1 flex justify-center">
    <a href="/admin/dashboard" className="btn btn-ghost text-2xl font-bold">
      AdminPanel
    </a>
  </div>

  <div className="flex-none flex gap-3 items-center">
    <label className="swap swap-rotate cursor-pointer">
      <input type="checkbox" onChange={toggleTheme} />
      <Moon className="swap-on w-6 h-6 text-gray-700" />
      <Sun className="swap-off w-6 h-6 text-blue-400" />
    </label>

    <button onClick={handleLogout} className="btn btn-outline btn-sm">
      Logout
    </button>
  </div>
</div>

  );
};

export default AdminNavbar;
