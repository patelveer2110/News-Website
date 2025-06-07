import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import debounce from "lodash/debounce";
import { backendURL } from "../App";
import { adminAuth } from "../hooks/adminAuth";

const AdminHome = () => {
  const [posts, setPosts] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { token, adminId } = adminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, adminRes] = await Promise.all([
          axios.get(`${backendURL}/api/post/admin/${adminId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${backendURL}/api/admin/profile/${adminId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setPosts(postsRes.data);
        setFollowersCount(adminRes.data.followers.length || 0);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [adminId, token]);

  const debouncedSearch = useMemo(() => debounce((value) => {
    setSearchTerm(value);
  }, 300), []);

  const filteredPosts = useMemo(() => {
    if (!searchTerm.trim()) return posts;
    return posts.filter(post => post.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [posts, searchTerm]);

  const postStats = useMemo(() => ({
    total: posts.length,
    drafted: posts.filter(p => p.status === "drafted").length,
    published: posts.filter(p => p.status === "published").length,
    scheduled: posts.filter(p => p.status === "scheduled").length,
    views: posts.reduce((acc, p) => acc + (p.views || 0), 0),
    likes: posts.reduce((acc, p) => acc + (p.likesCount || 0), 0),
  }), [posts]);

  const progress = useMemo(() => ({
    drafted: postStats.total ? (postStats.drafted / postStats.total) * 100 : 0,
    published: postStats.total ? (postStats.published / postStats.total) * 100 : 0,
    scheduled: postStats.total ? (postStats.scheduled / postStats.total) * 100 : 0,
  }), [postStats]);

  const recentPosts = useMemo(() => [...filteredPosts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5), [filteredPosts]);

  const topPosts = useMemo(() => [...filteredPosts]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 3), [filteredPosts]);

  const handleFilterRedirect = (filter) => {
    navigate(`/admin/post${filter ? `?status=${filter}` : ""}`);
  };

  const handlePostRedirect = (id) => {
    navigate(`/post/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner text-primary loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-2 text-base-content">Admin Dashboard</h1>

      {/* Search */}
      <input
        type="search"
        placeholder="Search posts by title..."
        className="input input-bordered w-full max-w-md mb-6"
        onChange={(e) => debouncedSearch(e.target.value)}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-10">
        {[{
          label: "Total Posts",
          value: postStats.total,
          bgClass: "bg-primary",
        }, {
          label: "Drafts",
          value: postStats.drafted,
          progressPercent: progress.drafted,
          progressColor: "bg-yellow-400",
          filter: "drafted",
        }, {
          label: "Published",
          value: postStats.published,
          progressPercent: progress.published,
          progressColor: "bg-green-500",
          filter: "published",
        }, {
          label: "Scheduled",
          value: postStats.scheduled,
          progressPercent: progress.scheduled,
          progressColor: "bg-blue-500",
          filter: "scheduled",
        }, {
          label: "Followers",
          value: followersCount,
          bgClass: "bg-secondary",
        }, {
          label: "Total Likes",
          value: postStats.likes,
          bgClass: "bg-error",
        }].map(({ label, value, filter, progressPercent, progressColor, bgClass }, idx) => (
          <div
            key={idx}
            className={`card p-5 shadow cursor-pointer flex flex-col justify-between 
              hover:scale-[1.03] transition-transform rounded-lg
              ${filter ? "hover:bg-primary hover:text-white" : bgClass || "bg-base-200"}
            `}
            onClick={() => filter && handleFilterRedirect(filter)}
          >
            <div>
              <h3 className="text-sm font-semibold">{label}</h3>
              <p className="text-3xl font-bold">{value}</p>
            </div>
            {progressPercent !== undefined && (
              <div className="w-full bg-base-300 rounded-full h-2 mt-4 overflow-hidden">
                <div
                  className={`${progressColor} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Top Viewed Posts */}
      <section>
        <h2 className="text-xl font-bold mb-4">Top Viewed Posts</h2>
        {topPosts.length === 0 ? (
          <p className="italic text-base-content/60">No posts found.</p>
        ) : (
          <ul className="bg-base-200 p-4 rounded-xl shadow divide-y divide-base-300">
            {topPosts.map(post => (
              <li
                key={post._id}
                onClick={() => handlePostRedirect(post._id)}
                className="py-3 px-3 hover:bg-base-300 cursor-pointer rounded-lg flex justify-between items-center transition-all"
                title={`Status: ${post.status}`}
              >
                <div>
                  <p className="font-semibold text-lg">{post.title}</p>
                  <p className="text-sm text-base-content/70 flex gap-4">
                    <span>👁️ {post.views || 0} views</span>
                    <span>❤️ {post.likesCount || 0} likes</span>
                    <span className="capitalize font-medium px-2 py-0.5 rounded text-xs bg-base-content/10">{post.status}</span>
                  </p>
                </div>
                <span className="text-xs text-base-content/50">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Recent Posts */}
      <section>
        <h2 className="text-xl font-bold mb-4">Recent Posts</h2>
        {recentPosts.length === 0 ? (
          <p className="italic text-base-content/60">No posts found.</p>
        ) : (
          <ul className="bg-base-200 p-4 rounded-xl shadow divide-y divide-base-300">
            {recentPosts.map(post => (
              <li
                key={post._id}
                onClick={() => handlePostRedirect(post._id)}
                className="py-3 px-3 hover:bg-base-300 cursor-pointer rounded-lg flex justify-between items-center transition-all"
                title={`Status: ${post.status}`}
              >
                <div>
                  <p className="font-semibold text-lg">{post.title}</p>
                  <p className="text-sm text-base-content/70">
                    Status: <span className="capitalize font-medium">{post.status}</span> | Created:{" "}
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xs text-base-content/50">
                  {new Date(post.createdAt).toLocaleTimeString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Floating Button */}
      <button
        onClick={() => navigate("/admin/create")}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-primary hover:bg-primary-focus text-white font-bold py-3 px-5 rounded-full shadow-lg transition-all text-lg z-50"
      >
        + Create Post
      </button>
    </div>
  );
};

export default AdminHome;
