import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { backendURL } from "../App";
import axios from "axios";
import CommentSection from "../components/CommentSection";
import { userAuth } from "../hooks/userAuth";
import ReportReasonModal from "../components/ReportReasonModal";

const Post = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const { token, userId, role } = userAuth() ||{};

  const fetchPost = async () => {
    try {
      const viewParam = role === 'user' ? "true" : "false";
      const response = await axios.get(`${backendURL}/api/post/${id}?view=${viewParam}`);
      setPost(response.data);
      if (userId) {
        setIsLiked(response.data.likes.includes(userId));
      }
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async () => {
    try {
      const response = await axios.put(
        `${backendURL}/api/post/like/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPost(response.data.post);
      setIsLiked(response.data.post.likes.includes(userId));
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleReportPost = async (reason) => {
    if (!reason.trim()) return alert("Reason is required");
    try {
      const response = await axios.post(
        `${backendURL}/api/post/report/${id}`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(response.data.msg);
      setIsReportModalOpen(false);
    } catch (error) {
      const msg = error?.response?.data?.msg || "Error reporting post.";
      alert(msg);
      console.error("Report Post Error:", error);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-3xl font-bold">{post.title}</h1>
          <p className="text-gray-600">{post.category || "Article"}</p>
        </div>

        {role === "user" && userId !== post.createdBy?._id && (
          <button
            onClick={() => setIsReportModalOpen(true)}
            title="Report this post"
            className="text-red-500 hover:text-red-700 text-sm border border-red-300 px-3 py-1 rounded-full transition duration-200"
          >
            <i className="fas fa-flag mr-1"></i> Report
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <img
            src={post.createdBy?.profileImage}
            alt={post.createdBy?.username || "Author"}
            className="w-10 h-10 rounded-full mr-3"
          />
          <div>
            <p className="text-sm font-semibold">{post.createdBy?.username || "Admin"}</p>
            <p className="text-xs text-gray-500">
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {role === "user" && (
            <button
              onClick={toggleLike}
              className={`btn btn-sm gap-2 transition-all duration-200 ${
                isLiked
                  ? "bg-blue-500 text-white border-none hover:bg-blue-600"
                  : "btn-outline text-gray-600"
              }`}
            >
              <i className={`fas fa-thumbs-up ${isLiked ? "animate-ping-slow" : ""}`}></i>
              {post.likes.length}
            </button>
          )}

          <div className="flex items-center text-gray-600 text-sm gap-1">
            <i className="fas fa-eye"></i>
            <span>{post.views}</span>
          </div>
        </div>
      </div>

      <div className="w-full aspect-[4/1] mb-4 rounded-lg overflow-hidden">
        <img
          src={post.bannerImage}
          alt="Post Banner"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="prose dark:prose-invert">
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold">Tags:</h2>
        <div className="flex flex-wrap gap-2 mt-2">
          {post.tags &&
            post.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                #{tag.trim()}
              </span>
            ))}
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-2">Comments</h3>

      <CommentSection postId={id} />

      {/* Report Modal */}
      <ReportReasonModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReportPost}
        title="Report Post"
      />
    </div>
  );
};

export default Post;
