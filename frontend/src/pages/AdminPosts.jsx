import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { backendURL } from "../App";
import { adminAuth } from "../hooks/adminAuth";

const statusOptions = [
  { label: "All", value: "" },
  { label: "Published", value: "published" },
  { label: "Unpublished", value: "unpublished" },
  { label: "Drafted", value: "drafted" },
  { label: "Scheduled", value: "scheduled" },
];

const sortOptions = [
  { label: "Newest First", value: "createdAt_desc" },
  { label: "Oldest First", value: "createdAt_asc" },
  { label: "Title A-Z", value: "title_asc" },
  { label: "Title Z-A", value: "title_desc" },
];

const AdminPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [sortOrder, setSortOrder] = useState("createdAt_desc");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { token, adminId } = adminAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const statusParam = params.get("status") || "";

    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${backendURL}/api/post/admin/${adminId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        let fetchedPosts = res.data;

        if (statusParam) {
          fetchedPosts = fetchedPosts.filter((post) => post.status === statusParam);
        }

        setFilterStatus(statusParam);
        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
        window.alert("Error fetching posts. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [location.search, adminId, token]);

  const sortedPosts = [...posts]
    .filter((post) => post.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      switch (sortOrder) {
        case "createdAt_asc":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "createdAt_desc":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "title_asc":
          return a.title.localeCompare(b.title);
        case "title_desc":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

  const statusCounts = posts.reduce(
    (acc, post) => {
      acc.total++;
      acc[post.status] = (acc[post.status] || 0) + 1;
      return acc;
    },
    { total: 0 }
  );

  const handleEdit = (post) => {
    navigate(`/admin/create`, { state: { post } });
  };

  const handleDelete = async (postId) => {
    const confirmed = window.confirm("Are you sure you want to delete this post?");
    if (!confirmed) return;

    try {
      await axios.delete(`${backendURL}/api/post/delete/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts((prev) => prev.filter((post) => post._id !== postId));
      window.alert("Post deleted.");
    } catch (error) {
      console.error("Failed to delete post:", error);
      window.alert("Error deleting post. Please try again.");
    }
  };

  const togglePublish = async (post) => {
    const newStatus = post.status === "published" ? "unpublished" : "published";
    try {
      const res = await axios.put(
        `${backendURL}/api/post/update/status/${post._id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts((prev) =>
        prev.map((p) => (p._id === post._id ? { ...p, status: res.data.status } : p))
      );
    } catch (error) {
      console.error("Failed to update status:", error);
      window.alert("Error updating status. Try again.");
    }
  };

  const handleFilterChange = (value) => {
    const searchParams = new URLSearchParams(location.search);
    value ? searchParams.set("status", value) : searchParams.delete("status");
    navigate(`?${searchParams.toString()}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">Manage Posts</h2>
        <Link to="/admin/create" className="btn btn-accent">
          ➕ Create New Post
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {["total", "published", "drafted", "scheduled", "unpublished"].map((key) => (
          <div key={key} className="bg-base-200 p-4 rounded-xl text-center shadow">
            <p className="font-bold capitalize">{key}</p>
            <p>{statusCounts[key] || 0}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <input
          placeholder="🔍 Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input input-bordered w-full sm:w-64"
        />
        <select
          value={filterStatus}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="select select-bordered"
        >
          {statusOptions.map(({ label, value }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="select select-bordered"
        >
          {sortOptions.map(({ label, value }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Posts Table */}
      {loading ? (
        <div className="text-center w-full py-6">
          <div className="w-6 h-6 border-4 border-dashed border-gray-500 rounded-full animate-spin mx-auto"></div>
        </div>
      ) : sortedPosts.length === 0 ? (
        <p className="text-center text-gray-500">No posts found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full table-zebra shadow rounded-lg">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Created At</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedPosts.map((post) => (
                <tr key={post._id}>
                  <td>
                    <Link
                      to={`/post/${post._id}`}
                      state={{ post }}
                      className="text-blue-600 hover:underline"
                    >
                      {post.title}
                    </Link>
                  </td>
                  <td className="capitalize">{post.category}</td>
                  <td>
                    <span
                      className={`px-2 py-1 text-xs rounded-full text-white ${
                        post.status === "published"
                          ? "bg-green-500"
                          : post.status === "drafted"
                          ? "bg-orange-500"
                          : post.status === "scheduled"
                          ? "bg-blue-500"
                          : "bg-gray-500"
                      }`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td>
                    {post.status === "scheduled" && post.scheduledAt
                      ? new Date(post.scheduledAt).toLocaleString()
                      : new Date(post.createdAt).toLocaleString()}
                  </td>
                  <td>
                    <div className="flex gap-2 flex-wrap justify-center">
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => handleEdit(post)}
                      >
                        Edit
                      </button>
                      {post.status !== "drafted" && (
                        <button
                          className={`btn btn-sm ${
                            post.status === "published" ? "btn-warning" : "btn-success"
                          }`}
                          onClick={() => togglePublish(post)}
                        >
                          {post.status === "published" ? "Unpublish" : "Publish"}
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-error"
                        onClick={() => handleDelete(post._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPosts;
