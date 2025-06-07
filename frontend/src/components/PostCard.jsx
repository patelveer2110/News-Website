import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { backendURL } from "../App";
import { userAuth } from "../hooks/userAuth";
import CommentDrawer from "./CommentDrawer";
import ReportReasonModal from "./ReportReasonModal";

const PostCard = ({ post }) => {
  const { token, userId } = userAuth() || {};
  const [isLiked, setIsLiked] = useState(post.likes.some((id) => id.toString() === userId));
  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [commentsCount, setCommentsCount] = useState(post.comments?.length || 0);
  const [commentDrawerOpen, setCommentDrawerOpen] = useState(false);
  const [commentAnchor, setCommentAnchor] = useState({ top: 0, left: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const menuRef = useRef();

  const openDrawer = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setCommentAnchor({ top: rect.top + rect.height + window.scrollY, left: rect.left + window.scrollX });
    setCommentDrawerOpen(true);
  };

  const toggleLike = async (e) => {
    e.preventDefault();
    if (!token) {
      const confirmLogin = window.confirm("You must be logged in to like. Do you want to login now?");
      if (confirmLogin) {
        window.location.href = "/login"; // or use useNavigate from react-router
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
    } finally {
      setIsLiking(false);
    }
  };

  const handleReportSubmit = async (reason) => {
    if (!token) {
      const confirmLogin = window.confirm("You must be logged in to Report. Do you want to login now?");
      if (confirmLogin) {
        window.location.href = "/login"; // or use useNavigate from react-router
      }
      return;
    }
    try {
      const response = await axios.post(
        `${backendURL}/api/post/report/${post._id}`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(response.data.msg || "Post reported successfully.");
      setIsReportModalOpen(false);
    } catch (error) {
      alert(error?.response?.data?.msg || "Error reporting post.");
      console.error("Error reporting post:", error);
    }
  };


  useEffect(() => {
    const fetchCommentCount = async () => {
      try {
        const res = await axios.get(`${backendURL}/api/comment/comments/${post._id}`);
        setCommentsCount(res.data.length);
      } catch (err) {
        console.error("Failed to fetch comments", err);
      }
    };
    fetchCommentCount();
  }, [post._id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const contentPreview = post.content.length > 120 ? `${post.content.substring(0, 120)}...` : post.content;

  return (
    <div className="overflow-hidden rounded-lg shadow-lg bg-white dark:bg-gray-800 max-w-md mx-auto relative transition-all duration-500 ease-in-out mb-6">
      <Link to={`/post/${post._id}`} className="block cursor-pointer">
        <div className="relative">
          <img
            alt="Banner"
            src={post.bannerImage}
            className="w-full h-auto max-h-64 object-contain bg-base-100"
          />
          <div className="absolute top-2 right-2 z-10" ref={menuRef}>
            <button
              aria-expanded={isMenuOpen}
              aria-label="Open options menu"
              className="btn btn-sm btn-circle bg-gray-700 text-gray-200 border border-gray-300 hover:bg-gray-100 shadow"
              onClick={(e) => {
                e.preventDefault();
                setIsMenuOpen((prev) => !prev);
              }}
            >
              <i className="fas fa-ellipsis-h"></i>
            </button>
            {isMenuOpen && (
              <>
                <div className="fixed inset-0 bg-black opacity-10 z-10"></div>
                <div className="absolute right-0 z-20 mt-2 w-40 bg-white border rounded shadow-md">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setIsMenuOpen(false);
                      setIsReportModalOpen(true);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100 focus:bg-red-100 focus:outline-none"
                  >
                    Report Post
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="p-4">
          <p className="font-medium text-indigo-500 text-sm">{post.category || "Article"}</p>
          <h2 className="font-bold text-xl text-gray-800 dark:text-white mt-1">{post.title}</h2>
          <div className="text-gray-500 dark:text-gray-300 text-sm mt-2 line-clamp-3">
            <div dangerouslySetInnerHTML={{ __html: contentPreview }} />
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {post.tags?.map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full dark:bg-indigo-700 dark:text-white"
              >
                #{tag.trim()}
              </span>
            ))}
          </div>

          <div className="flex items-center mt-4">
            <img
              src={
                post.createdBy?.profileImage ||
                "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
              }
              alt={post.createdBy?.username || "Author"}
              className="object-cover h-10 w-10 rounded-full"
            />
            <div className="ml-3">
              <Link
                to={`/admin/profile/${post.createdBy._id}`}
                className="text-indigo-600 hover:underline font-semibold text-sm"
                onClick={(e) => e.stopPropagation()}
              >
                @{post.createdBy?.username || "admin"}
              </Link>
              <p className="text-gray-400 dark:text-gray-300 text-xs">
                {new Date(post.createdAt).toLocaleDateString("en-GB")}
              </p>
            </div>
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-4 mt-2 px-4 pb-4">
        <button
          onClick={toggleLike}
          disabled={isLiking}
          className={`btn btn-sm gap-2 transition-all duration-200 ${isLiked
              ? "bg-blue-500 text-white border-none hover:bg-blue-600"
              : "btn-outline text-gray-600"
            } ${isLiking ? "opacity-60 cursor-not-allowed" : ""}`}
          aria-pressed={isLiked}
          aria-label={isLiked ? "Unlike post" : "Like post"}
        >
          <i
            className={`fas fa-thumbs-up ${isLiked ? "text-white animate-bounce" : "text-gray-600"}`}
          ></i>
          {likesCount}
        </button>

        <div className="flex items-center text-gray-600 text-sm gap-1">
          <i className="fas fa-eye"></i>
          <span>{post.views}</span>
        </div>

        <button
          onClick={openDrawer}
          aria-controls={`comments-section-${post._id}`}
          className="btn btn-sm btn-outline gap-1 text-gray-600"
        >
          <i className="fas fa-comment"></i>
          <span>Comments ({commentsCount})</span>
        </button>
      </div>

      {/* Comment Drawer */}
      <CommentDrawer
        isOpen={commentDrawerOpen}
        onClose={() => setCommentDrawerOpen(false)}
        postId={post._id}
        anchor={commentAnchor}
      />

      {/* Report Modal */}
      <ReportReasonModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReportSubmit}
      />
    </div>
  );
};

export default PostCard;
