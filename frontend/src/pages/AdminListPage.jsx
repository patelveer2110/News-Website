import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { backendURL } from "../App";

const AdminListPage = () => {
  const { query } = useParams();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const userIdFromStorage = localStorage.getItem("userId");
    setCurrentUserId(userIdFromStorage);
  }, []);

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      try {
        const url = query
          ? `${backendURL}/api/admin/search/${encodeURIComponent(query)}`
          : `${backendURL}/api/admin/all`;
        const response = await axios.get(url);
        setAdmins(response.data);
      } catch (error) {
        console.error("Failed to fetch admins", error);
        setAdmins([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, [query]);

  const handleFollowToggle = async (adminId) => {
    if (!currentUserId) {
      alert("Please login to follow/unfollow");
      return;
    }

    setFollowLoading((prev) => ({ ...prev, [adminId]: true }));

    try {
      const res = await axios.post(
        `${backendURL}/api/admin/follow-unfollow/${adminId}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setAdmins((prevAdmins) =>
        prevAdmins.map((admin) =>
          admin._id === adminId ? res.data.admin : admin
        )
      );
    } catch (error) {
      console.error("Follow/unfollow failed", error);
      alert("Failed to follow/unfollow");
    } finally {
      setFollowLoading((prev) => ({ ...prev, [adminId]: false }));
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h2 className="text-3xl font-bold mb-8 text-center">
        {query ? `Admins matching "${query}"` : "All Admins"}
      </h2>

      {loading ? (
        <p className="text-center text-gray-500 text-lg">Loading admins...</p>
      ) : admins.length === 0 ? (
        <p className="text-center text-gray-400 text-lg">No admins found.</p>
      ) : (
        <div className="flex flex-col space-y-6">
          {admins.map((admin) => {
            const isFollowing =
              admin.followers?.some((followerId) => followerId === currentUserId) ||
              false;

            return (
              <div
                key={admin._id}
                className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <div className="card-body flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={admin.profileImage || "/default-profile.png"}
                      alt={`${admin.username} profile`}
                      className="w-20 h-20 rounded-full border border-gray-300 object-cover"
                    />
                    <div>
                      <h3 className="text-xl font-semibold">{admin.username}</h3>
                      <p className="text-sm text-gray-600">{admin.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-gray-700">
                    <div className="text-center sm:text-left">
                      <span className="font-semibold text-lg">{admin.followers?.length || 0}</span>{" "}
                      Followers
                    </div>
                    <div className="text-center sm:text-left">
                      <span className="font-semibold text-lg">{admin.postCount || 0}</span> Posts
                    </div>

                    <button
                      disabled={followLoading[admin._id]}
                      onClick={() => handleFollowToggle(admin._id)}
                      className={`btn ${isFollowing ? "btn-error" : "btn-primary"}`}
                    >
                      {followLoading[admin._id]
                        ? "Please wait..."
                        : isFollowing
                        ? "Unfollow"
                        : "Follow"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminListPage;
