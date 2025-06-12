import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { userAuth } from "../hooks/userAuth";
import { backendURL } from "../App";

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { token } = userAuth();

  const [user, setUser] = useState(null);
  const [followedAdmins, setFollowedAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${backendURL}/api/user/profile/${userId}`);
        setUser(res.data.user);
        setFollowedAdmins(
          res.data.followedAdmins.map((admin) => ({
            ...admin,
            isFollowing: true,
          }))
        );
      } catch (err) {
        console.error("Failed to load user profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const toggleFollow = async (adminId) => {
    try {
      await axios.post(
        `${backendURL}/api/admin/follow-unfollow/${adminId}`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFollowedAdmins((prev) =>
        prev.map((admin) =>
          admin._id === adminId
            ? { ...admin, isFollowing: !admin.isFollowing }
            : admin
        )
      );
    } catch (err) {
      console.error("Follow/unfollow failed:", err);
    }
  };

  if (loading || !user) {
    return <div className="text-center p-10 text-gray-500">Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="card bg-base-100 shadow-lg rounded-lg p-6 mb-8">
        <div className="flex items-center gap-6">
          <img
            src={user.profileImage}
            alt="User"
            className="w-24 h-24 rounded-full object-cover border-4 border-primary"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{user.username}</h2>
            <p className="text-gray-600">{user.email}</p>
            <div className="mt-3">
              <button
                className="btn btn-sm btn-primary"
                onClick={() => navigate(`/edit-profile/${userId}`)}
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Admins Followed Section */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Following Admins</h3>
        {followedAdmins.length === 0 ? (
          <p className="text-gray-400">Not following any admins.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {followedAdmins.map((admin) => (
              <div
                key={admin._id}
                className="card bg-base-200 p-4 flex items-center gap-4 rounded-lg"
              >
                <img
                  src={admin.profileImage}
                  alt="Admin"
                  className="w-16 h-16 rounded-full object-cover border-2"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{admin.username}</h4>
                </div>
                <button
                  className={`btn btn-xs ${
                    admin.isFollowing ? "btn-outline" : "btn-primary"
                  }`}
                  onClick={() => toggleFollow(admin._id)}
                >
                  {admin.isFollowing ? "Unfollow" : "Follow"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
