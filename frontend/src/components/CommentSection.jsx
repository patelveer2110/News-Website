import { useState, useEffect, useRef } from 'react';
import { backendURL } from '../App';
import axios from 'axios';
import { format } from 'timeago.js';
import { userAuth } from '../hooks/userAuth';
import ReportReasonModal from '../components/ReportReasonModal';
import { useSearchParams } from 'react-router-dom';

const CommentSection = ({ postId, onNewComment }) => {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportingCommentId, setReportingCommentId] = useState(null);
  const { token, userId, role } = userAuth() || {};

  const [searchParams] = useSearchParams();
  const highlightedCommentId = searchParams.get('highlight');

  const commentRefs = useRef({});

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${backendURL}/api/comment/comments/${postId}`);
      if (response.status === 200) {
        const sortedComments = response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setComments(sortedComments);
      } else {
        console.error('Failed to fetch comments');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

 const handleAddComment = async () => {
  if (!token) {
    const confirmLogin = window.confirm("You must be logged in to comment. Do you want to login now?");
    if (confirmLogin) {
      window.location.href = "/login"; // or use useNavigate from react-router
    }
    return;
  }

  if (commentText.trim() === '') return;

  try {
    const response = await axios.put(
      `${backendURL}/api/comment/addcomment/${postId}`,
      { comment: commentText },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status !== 200 && response.status !== 201) {
      console.error('Failed to add comment');
      return;
    }

    setCommentText('');
    fetchComments();
    if (onNewComment) onNewComment();
  } catch (error) {
    console.error('Error adding comment:', error);
  }
};


  const openReportModal = (commentId) => {
    setReportingCommentId(commentId);
    setIsModalOpen(true);
  };

  const handleReportSubmit = async (reason) => {
    if (!reportingCommentId) return;

    try {
      const response = await axios.post(
        `${backendURL}/api/comment/report/${reportingCommentId}`,
        { reason },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert(response.data.msg);
      fetchComments(); // Refresh comments
    } catch (error) {
      const msg = error?.response?.data?.msg || 'Error reporting comment.';
      alert(msg);
      console.error('Error reporting comment:', error);
    } finally {
      setReportingCommentId(null);
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  useEffect(() => {
    if (highlightedCommentId && commentRefs.current[highlightedCommentId]) {
      commentRefs.current[highlightedCommentId].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [comments, highlightedCommentId]);

  return (
    <div className="mt-6">
      {role !== 'admin' && (
        <div className="mb-4">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            className="w-full textarea textarea-bordered rounded mb-2"
            rows={3}
          />
          <button
            onClick={handleAddComment}
            className="btn btn-primary btn-sm"
          >
            Post Comment
          </button>
        </div>
      )}

      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => {
            const isHighlighted = comment._id === highlightedCommentId;
            return (
              <div
                key={comment._id}
                ref={(el) => (commentRefs.current[comment._id] = el)}
                className={`card transition-all duration-300 shadow-sm ${
                  isHighlighted
                    ? 'bg-warning/20 border border-warning'
                    : 'bg-base-200'
                }`}
              >
                <div className="card-body p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="avatar">
                      <div className="w-10 rounded-full ring ring-base-300 ring-offset-base-100 ring-offset-2">
                        <img src={comment.userId?.profileImage} alt="User" />
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-base-content">
                        {comment.userId?.username}
                      </p>
                      <span className="text-xs text-base-content/50">
                        {format(comment.createdAt)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-base-content">{comment.comment}</p>

                  {role !== 'admin' && userId !== comment.userId?._id && (
                    <button
                      onClick={() => openReportModal(comment._id)}
                      className="mt-2 text-error text-xs hover:underline"
                    >
                      Report
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-base-content/60">No comments yet.</p>
        )}
      </div>

      <ReportReasonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleReportSubmit}
      />
    </div>
  );
};

export default CommentSection;
