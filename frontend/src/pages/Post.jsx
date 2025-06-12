import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { backendURL } from "../App";
import axios from "axios";
import CommentSection from "../components/CommentSection";
import { userAuth } from "../hooks/userAuth";
import ReportReasonModal from "../components/ReportReasonModal";
import { useConfirmDialog } from "../context/ConfirmDialogContext";

const Post = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const { showConfirm, showAlert } = useConfirmDialog();
  const { token, userId, role } = userAuth() || {};

  const fetchPost = async () => {
    try {
      const viewParam = role === "user" ? "true" : "false";
      console.log(userId);
      
      // ✅ Correct
const response = await axios.get(`${backendURL}/api/post/${id}?view=${viewParam}&userId=${userId}`);

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

  const toggleLike = async (e) => {
    e.preventDefault();
    if (!token) {
      const confirmed = await showConfirm({
        title: "Login required",
        description: "You must be logged in to like. Do you want to login now?",
      });
      if (confirmed) {
        window.location.href = "/login";
      }
      return;
    }
    if (isLiking) return;
    setIsLiking(true);
    try {
      const response = await axios.put(
        `${backendURL}/api/post/like/${post._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedLikes = response.data.post.likes;
      setIsLiked(updatedLikes.some((id) => id.toString() === userId));
      setLikesCount(updatedLikes.length);
    } catch (error) {
      console.error("Error liking post:", error);
      await showAlert({
        title: "Error",
        description: "Failed to like the post. Please try again.",
      });
    } finally {
      setIsLiking(false);
    }
  };

  const handleReportPost = async (reason) => {
    if (!reason.trim()) {
      showAlert({
        title: "Report Error",
        description: "Please provide a reason for reporting this post.",
      });
      return;
    }
    try {
      const response = await axios.post(
        `${backendURL}/api/post/report/${id}`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showAlert({
        title: "Reported",
        description: response.data.msg || "Post reported successfully.",
      });
      setIsReportModalOpen(false);
    } catch (error) {
      const msg = error?.response?.data?.msg || "Error reporting post.";
      showAlert({
        title: "Report Error",
        description: msg,
      });
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

          {/* Average Rating Display */}
          <div className="flex items-center gap-2 text-yellow-500 mt-2 text-sm">
            <i className="fas fa-star" />
            {post.rating?.count > 0 ? (
              <span>
                {post.rating.average.toFixed(1)} / 5 ({post.rating.count} rating
                {post.rating.count > 1 ? "s" : ""})
              </span>
            ) : (
              <span>No ratings yet</span>
            )}
          </div>
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
          {role !== "admin" && (
            <button
              onClick={toggleLike}
              disabled={isLiking}
              className={`btn btn-sm gap-2 transition-all duration-200 ${
                isLiked ? "btn-primary" : "btn-outline"
              } ${isLiking ? "opacity-60 cursor-not-allowed" : ""}`}
              aria-pressed={isLiked}
              aria-label={isLiked ? "Unlike post" : "Like post"}
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
