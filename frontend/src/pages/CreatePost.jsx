import React, { useState, useEffect } from "react";
import TiptapEditor from "../components/TipTapEditor";
import { backendURL } from "../App"; // Adjust the import path as necessary
import axios from "axios";
import { adminAuth } from "../hooks/adminAuth";
import { useLocation } from "react-router-dom";




const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  // const [tags, setTags] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");


  const [banner, setBanner] = useState(null);
  const [content, setContent] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [showScheduler, setShowScheduler] = useState(false);
  const { token, adminId } = adminAuth();
  const location = useLocation();
const editingPost = location.state?.post;

useEffect(() => {
  if (editingPost) {
    setTitle(editingPost.title || "");
    setCategory(editingPost.category || "");
    setTags(editingPost.tags || []);
    setContent(editingPost.content || "");
    setScheduledDate(editingPost.scheduledAt || "");
  }
}, [editingPost]);
const handleSubmit = async (status) => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("category", category);
  formData.append("tags", tags.join(","));
  formData.append("status", status);
  if (banner) formData.append("banner", banner);
  formData.append("content", content);
  if (status === "scheduled" && scheduledDate) {
    formData.append("scheduledAt", scheduledDate);
  }

  try {
    const url = editingPost
      ? `${backendURL}/api/post/update/${editingPost._id}`
      : `${backendURL}/api/post/create`;
    const method = editingPost ? "put" : "post";
    console.log(formData);
    
    const res = await axios[method](url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    alert(
      editingPost
        ? "Post updated successfully!"
        : status === "scheduled"
        ? "Post scheduled successfully!"
        : "Post created successfully!"
    );
    // Reset fields
    setTitle("");
    setCategory("");
    setTags([]);
    setTagInput("");
    setBanner(null);
    setContent("");
    setScheduledDate("");
    setShowScheduler(false);
  } catch (err) {
    console.error(err);
    alert("Failed to " + (editingPost ? "update" : "create") + " post.");
  }
};



  return (
    <div className="max-w-4xl mx-auto p-8 bg-base-100 rounded-xl shadow-lg space-y-6">
      <h2 className="text-3xl font-bold text-primary">Create New Blog Post</h2>

      <form className="space-y-6">
        {/* Title */}
        <div className="form-control">
          <label className="label font-semibold text-base-content">Title</label>
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="Enter your post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Category */}
        <div className="form-control">
          <label className="label font-semibold text-base-content">Category</label>
          <select
            className="select select-bordered w-full"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option disabled value="">Select category</option>
            <option>Technology</option>
            <option>Health</option>
            <option>Education</option>
            <option>Lifestyle</option>
          </select>
        </div>

        {/* Tags */}
        <div className="form-control">
          <label className="label font-semibold text-base-content">Tags</label>

          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="bg-primary text-white px-3 py-1 rounded-full flex items-center gap-2"
              >
                {tag}
                <button
                  type="button"
                  onClick={() =>
                    setTags(tags.filter((_, i) => i !== index))
                  }
                  className="text-white hover:text-red-300"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>

          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="Type and press Enter or comma"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
                e.preventDefault();
                if (!tags.includes(tagInput.trim())) {
                  setTags([...tags, tagInput.trim()]);
                }
                setTagInput("");
              }
            }}
          />
        </div>

        {/* Banner */}
        <div className="form-control">
          <label className="label font-semibold text-base-content">Banner Image</label>
          <input
            type="file"
            accept="image/*"
            className="file-input file-input-bordered w-full"
            onChange={(e) => setBanner(e.target.files[0])}
          />
        </div>

        {/* TipTap Editor */}
        <div className="form-control">
          <label className="label font-semibold text-base-content">Content</label>
          <div className="border border-base-300 rounded-lg p-4 bg-base-200">
            <TiptapEditor content={content} onChange={setContent} />
          </div>
          
        </div>

        {/* Scheduled Date Picker */}
        {showScheduler && (
          <div className="form-control">
            <label className="label font-semibold text-base-content">
              Scheduled Date & Time
            </label>
            <input
              type="datetime-local"
              className="input input-bordered w-full"
              value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              required
            />
            <button
              onClick={async ()=> {await handleSubmit("scheduled")}}
              className="btn btn-accent mt-4"
            >
              Schedule Post
            </button>
          </div>
        )}

        {/* Button Dropdown */}
        {/* Enhanced Create Post Dropdown */}
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-primary flex items-center gap-2">
            <span>Create Post</span>
            <svg
              className="w-4 h-4 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M5.25 7L10 11.75 14.75 7z" />
            </svg>
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content z-[1] menu p-2 shadow-md bg-base-100 rounded-box w-56"
          >
            <li>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit("published");
                }}
                className="flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4 text-success"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z" />
                </svg>
                Publish Now
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowScheduler(true);
                }}
                className="flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4 text-warning"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 7V3m8 4V3m-9 8h10m-14 8h18a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Schedule Post
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit("drafted");
                }}
                className="flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4 text-info"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                </svg>
                Save as Draft
              </button>
            </li>
          </ul>

        </div>

      </form>
    </div>
  );
};

export default CreatePost;
