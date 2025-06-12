import React, { useState, useEffect } from "react";
import axios from "axios";
import PostCard from "../components/PostCard";
import { backendURL } from "../App";
import { useParams, useNavigate } from "react-router-dom";
import { userAuth } from "../hooks/userAuth";
import { useConfirmDialog } from "../context/ConfirmDialogContext";

function formatCount(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num;
}

const AdminProfilePage = () => {
  const { adminId } = useParams();
  const { token, userId } = userAuth() || {};
  const [admin, setAdmin] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showConfirm } = useConfirmDialog();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const [adminRes, postsRes] = await Promise.all([
          axios.get(`${backendURL}/api/admin/profile/${adminId}`, {
            params: { userId },
          }),
          axios.get(`${backendURL}/api/post/admin/${adminId}`),
        ]);
        setAdmin(adminRes.data);
        setPosts(postsRes.data);
        setIsFollowing(adminRes.data.isFollowing);
      } catch (err) {
        console.error("Failed to fetch admin profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, [adminId]);

  const handleFollowToggle = async () => {
    try {
      if (!token) {
        const confirmed = await showConfirm({
          title: "Login required",
          description: "You must be logged in to follow/unfollow. Do you want to login now?",
        });
        if (confirmed) {
          window.location.href = "/login"; // or navigate programmatically
        }
        return;
      }
      const res = await axios.post(
        `${backendURL}/api/admin/follow-unfollow/${adminId}`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedAdmin = res.data.admin;
      setAdmin((prev) => ({
        ...prev,
        followersCount: updatedAdmin.followers.length,
      }));
      setIsFollowing(updatedAdmin.followers.includes(userId));
    } catch (err) {
      console.error("Follow/unfollow failed:", err);
    }
  };

  const handleEditProfile = () => {
    // Redirect to admin profile edit page
    navigate(`/edit-profile/${adminId}`);
  };

  if (loading || !admin) {
    return <div className="text-center p-10 text-gray-500">Loading profile...</div>;
  }

  const isOwnProfile = adminId === userId;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="card bg-base-100 shadow-lg rounded-lg p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div>
            <img
              src={admin.profileImage}
              alt="Admin avatar"
              className="w-32 h-32 rounded-full object-cover border-4 border-primary"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-1">{admin.username}</h2>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300 mb-3">
              <div>
                <span className="font-semibold">{formatCount(admin.followersCount)}</span> Followers
              </div>
              <div>
                <span className="font-semibold">{posts.filter(p => p.status === "published").length}</span> Posts
              </div>
            </div>

            <div className="flex gap-4">
              {/* Show Edit button only if user is viewing their own profile */}
              {isOwnProfile ? (
                <button className="btn btn-sm btn-primary" onClick={handleEditProfile}>
                  Edit Profile
                </button>
              ) : (
                <button
                  className={`btn btn-sm ${isFollowing ? "btn-outline btn-primary" : "btn-primary"}`}
                  onClick={handleFollowToggle}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.length === 0 ? (
          <p className="text-center col-span-full text-gray-400">No posts to display.</p>
        ) : (
          posts
            .filter((post) => post.status === "published")
            .map((post) => <PostCard key={post._id} post={post} />)
        )}
      </div>
    </div>
  );
};

export default AdminProfilePage;
