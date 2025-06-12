import { useState, useEffect, useRef } from 'react';
import { backendURL } from '../App';
import axios from 'axios';
import { format } from 'timeago.js';
import { userAuth } from '../hooks/userAuth';
import ReportReasonModal from '../components/ReportReasonModal';
import { useSearchParams } from 'react-router-dom';
import { useConfirmDialog } from '../context/ConfirmDialogContext';

const CommentSection = ({ postId, onNewComment }) => {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportingCommentId, setReportingCommentId] = useState(null);
  const [rating, setRating] = useState(0);

  const { token, userId, role } = userAuth() || {};
  const [searchParams] = useSearchParams();
  const highlightedCommentId = searchParams.get('highlight');
  const commentRefs = useRef({});
  const { showConfirm, showAlert } = useConfirmDialog();

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${backendURL}/api/comment/comments/${postId}`);
      if (response.status === 200) {
        const sortedComments = response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setComments(sortedComments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  // const fetchRating = async () => {
  //   if (!token) return;
  //   try {
  //     const res = await axios.get(`${backendURL}/api/review/fetch/${postId}`, {
  //       headers: { Authorization: `Bearer ${token}` }
  //     });
  //     setRating(res.data?.rating || 0);
  //   } catch (err) {
  //     console.error("Error fetching rating", err);
  //   }
  // };

  const handleAddComment = async () => {
    if (!token) {
      const confirmed = await showConfirm({
        title: 'Login Required',
        description: 'You must be logged in to comment. Do you want to login now?',
      });
      if (confirmed) {
        window.location.href = '/login';
      }
      return;
    }
    if (commentText.trim() === '') return;

    try {
      const response = await axios.put(
        `${backendURL}/api/comment/addcomment/${postId}`,
        { comment: commentText },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status !== 200 && response.status !== 201) {
        await showAlert({
          title: 'Failed',
          description: 'Failed to add comment. Please try again.',
        });
        return;
      }
      setCommentText('');
      fetchComments();
      if (onNewComment) onNewComment();
    } catch (error) {
      console.error('Error adding comment:', error);
      await showAlert({
        title: 'Error',
        description: 'An error occurred while adding your comment.',
      });
    }
  };

const handleRatingSubmit = async () => {
  if (!token) {
    const confirmed = await showConfirm({
      title: 'Login Required',
      description: 'You must be logged in to rate. Do you want to login now?',
    });
    if (confirmed) {
      window.location.href = '/login';
    }
    return;
  }

  const confirmed = await showConfirm({
    title: 'Confirm Rating',
    description: `Are you sure you want to rate this post ${rating} star${rating > 1 ? 's' : ''}?`,
  });

  if (!confirmed) {
    console.log('Rating cancelled by user');
    return;
  }

  try {
    await axios.post(
      `${backendURL}/api/review/add-or-update`,
      { postId, rating },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    await showAlert({
      title: 'Success',
      description: `You rated this post ${rating} star${rating > 1 ? 's' : ''}.`,
    });
    console.log('Rating submitted:', rating);
  } catch (err) {
    await showAlert({
      title: 'Error',
      description: 'Rating failed to submit. Please try again.',
    });
    console.error('Error submitting rating:', err);
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await showAlert({ title: 'Report Submitted', description: response.data.msg });
      fetchComments();
    } catch (error) {
      const msg = error?.response?.data?.msg || 'Error reporting comment.';
      await showAlert({ title: 'Error', description: msg });
    } finally {
      setReportingCommentId(null);
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    fetchComments();
    // fetchRating();
  }, [postId]);

  useEffect(() => {
    if (highlightedCommentId && commentRefs.current[highlightedCommentId]) {
      commentRefs.current[highlightedCommentId].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [comments, highlightedCommentId]);

  return (
    <div className="mt-6">
      {role !== 'admin' && (
        <>
          <div className="mb-4">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="w-full textarea textarea-bordered rounded mb-2"
              rows={3}
            />
            <button onClick={handleAddComment} className="btn btn-primary btn-sm">Post Comment</button>
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Rate this post:</label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <i
                  key={star}
                  className={`fa-star cursor-pointer text-xl ${rating >= star ? 'fas text-yellow-400' : 'far text-gray-400'}`}
                  onClick={() => setRating(star)}
                ></i>
              ))}
            </div>
            <button onClick={handleRatingSubmit} className="btn btn-success btn-sm mt-2">Submit Rating</button>
          </div>
        </>
      )}

      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => {
            const isHighlighted = comment._id === highlightedCommentId;
            return (
              <div
                key={comment._id}
                ref={(el) => (commentRefs.current[comment._id] = el)}
                className={`card shadow-sm ${isHighlighted ? 'bg-warning/20 border-warning' : 'bg-base-200 border'}`}
              >
                <div className="card-body p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="avatar">
                      <div className="w-10 rounded-full">
                        <img src={comment.userId?.profileImage} alt="User" />
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{comment.userId?.username}</p>
                      <span className="text-xs text-gray-500">{format(comment.createdAt)}</span>
                    </div>
                  </div>
                  <p className="text-sm">{comment.comment}</p>

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
          <p className="text-gray-400">No comments yet.</p>
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