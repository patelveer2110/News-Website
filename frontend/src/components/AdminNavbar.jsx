import { useNavigate } from "react-router-dom";
import { adminAuth } from "../hooks/adminAuth";

const AdminNavbar = () => {
      const navigate = useNavigate();
      const {adminId} =adminAuth()
        const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    console.log("User logged out");
    navigate("/login");
    
  };
    return (
        <div className="navbar bg-base-100 shadow-sm">
            <div className="navbar-start flex items-center  ">
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /> </svg>
                    </div>
                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                        <li><a href="/admin/dashboard">Home</a></li>
                        <li><a href="/admin/post">Posts</a></li>
                        <li><a href="/admin/reports">Reports</a></li>
                        <li><a onClick={handleLogout} className="btn">LogOut</a></li>
                    </ul>
                </div>
                    <a className="btn btn-ghost text-xl hidden lg:inline-block">AdminPanel</a>
                
                {/* <a className="btn btn-ghost text-xl  lg:hidden">AdminPanel</a> */}
            </div>
             <div className="navbar-center lg:hidden">
    <a className="btn btn-ghost text-xl">AdminPanel</a>
  </div>
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1">
                    <li><a href="/admin/dashboard">Home</a></li>
                    <li><a href="/admin/post">Posts</a></li>
                    <li><a href="/admin/reports">Reports</a></li>
                    <li><a href={`/admin/profile/${adminId}`}>Profile</a></li>

                </ul>
            </div>
            <div className="navbar-end hidden lg:flex">
                <a onClick={handleLogout} className="btn">LogOut</a>
            </div>
            {/* <div className="navbar-end">
                <a className="btn">LogIn</a>
            </div> */}
        </div>
    );
}
export default AdminNavbar;