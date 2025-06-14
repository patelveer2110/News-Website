import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import { useConfirmDialog } from "../context/ConfirmDialogContext";
import { Sun, Moon } from "lucide-react";
import { userAuth } from "../hooks/userAuth";

const UserNavbar = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { showAlert } = useConfirmDialog();
  const navigate = useNavigate();
  // const token = localStorage.getItem("token");
  const { role, userId ,token } = userAuth() || {}; // Assuming userAuth provides role
console.log(userId);

  const { theme, toggleTheme } = useContext(ThemeContext);

  const handleSearch = async () => {
    const trimmed = searchValue.trim();
    if (!trimmed) {
      await showAlert({ title: "Search Error", description: "Please enter a search term." });
      return;
    }
    if (trimmed.startsWith("#")) {
      const tag = trimmed.slice(1);
      navigate(`/tag/${tag}`);
    } else {
      navigate(`/profile-search/${encodeURIComponent(trimmed)}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    console.log("User logged out");
    navigate("/login");
  };

  const handleLogin = () => navigate("/login");

  return (
    <div className="navbar bg-base-200 shadow-md text-base-content">
      {/* Left */}
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle text-base-content">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-20 p-2 shadow bg-base-100 border border-base-300 rounded-box w-52"
          >
            <li><a href="/user/dashboard">Homepage</a></li>
            {userId && (
          <li>
            <a href={`/user/profile/${userId}`}>Profile</a>
          </li>)}
            {token ? <li><button onClick={handleLogout}>Logout</button></li> : <li><button onClick={handleLogin}>Login</button></li>}
            
          </ul>
        </div>
      </div>

      {/* Center */}
      <div className="navbar-center">
        <a href="/user/dashboard" className="btn btn-ghost text-xl text-primary">News</a>
      </div>

      {/* Right */}
      <div className="navbar-end flex items-center gap-2">
        {/* Search Icon */}
        <button
          className="btn btn-ghost btn-circle"
          onClick={() => setShowSearch(!showSearch)}
          aria-label="Toggle Search"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-base-content" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        {/* Search Input */}
        {showSearch && (
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search #tag or admin"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="input input-bordered input-sm w-36 md:w-64 transition-all duration-300 bg-base-100 border-base-300 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        )}

        {/* Theme Toggle */}
        <div className="form-control">
          <label className="swap swap-rotate">
            <input type="checkbox" onChange={toggleTheme} />
            <Sun className="swap-off w-6 h-6 text-yellow-400" />
            <Moon className="swap-on w-6 h-6 text-gray-700 dark:text-blue-400" />
          </label>
        </div>
      </div>
    </div>
  );
};

export default UserNavbar;
