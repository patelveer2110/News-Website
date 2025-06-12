import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendURL } from "../App";
import { userAuth } from "../hooks/userAuth";
import { adminAuth } from "../hooks/adminAuth";

const EditProfile = () => {
  const role = localStorage.getItem("role"); // "user" or "admin"
  const isAdmin = role === "admin";

  // Call both hooks, use the correct one based on role
  const { userId, token: userToken } = userAuth();
  const { adminId, token: adminToken } = adminAuth();

  const id = isAdmin ? adminId : userId;
  const token = isAdmin ? adminToken : userToken;

  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!id || !token || !role) return;

    const fetchProfile = async () => {
      try {
        const url = `${backendURL}/api/${role}/profile/${id}`;
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = isAdmin ? res.data : res.data.user;

        setFormData({
          username: data.username || "",
          email: data.email || "",
        });

        setPreview(data.profileImage || "");
      } catch (error) {
        console.error("Failed to fetch profile", error);
      }
    };

    fetchProfile();
  }, [id, token, role, isAdmin]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const data = new FormData();
      data.append("username", formData.username);
      data.append("email", formData.email);
      if (profileImage) data.append("profileImage", profileImage);

      const url = `${backendURL}/api/${role}/profile/edit`;
      const method = isAdmin ? axios.put : axios.patch;

      const res = await method(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage(res.data.message || "Profile updated!");
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-base-200 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-primary mb-6 text-center">
        Edit {isAdmin ? "Admin" : "User"} Profile
      </h2>

      {message && (
        <div
          className={`mb-6 p-3 rounded-lg text-center ${
            message.toLowerCase().includes("failed")
              ? "bg-error text-error-content"
              : "bg-success text-success-content"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 font-semibold">Username</label>
          <input
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="input input-bordered w-full bg-base-100"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            readOnly
            className="input input-bordered w-full bg-base-100 text-gray-400 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Profile Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="file-input file-input-bordered w-full"
          />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="mt-4 w-28 h-28 rounded-full object-cover border-4 border-primary"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
