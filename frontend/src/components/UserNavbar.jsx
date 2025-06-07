import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { backendURL } from "../App";
import axios from "axios";

const UserNavbar = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const handleSearch = () => {
    const trimmed = searchValue.trim();

    if (!trimmed) {
      alert("Search cannot be empty.");
      return;
    }

    if (trimmed.startsWith("#")) {
      const tag = trimmed.slice(1);
      navigate(`/tag/${tag}`);
    } else {
      // Navigate to admin profile search route
      navigate(`/admin/profile-search/${encodeURIComponent(trimmed)}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    console.log("User logged out");
    navigate("/login");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div className="navbar bg-base-100 shadow-sm">
      {/* Start - Left Menu */}
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow"
          >
            <li>
              <a href="/user/dashboard">Homepage</a>
            </li>
            {token ? (
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            ) : (
              <li>
                <button onClick={handleLogin}>Login</button>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Center - Logo/Title */}
      <div className="navbar-center">
        <a href="/user/dashboard" className="btn btn-ghost text-xl">
          News
        </a>
      </div>

      {/* End - Search */}
      <div className="navbar-end flex items-center gap-2">
        <button
          className="btn btn-ghost btn-circle"
          onClick={() => setShowSearch(!showSearch)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>

        {showSearch && (
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search #tag or admin"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            className="input input-bordered input-sm w-36 md:w-64 transition-all duration-300 ease-in-out"
          />
        )}
      </div>
    </div>
  );
};

export default UserNavbar;
