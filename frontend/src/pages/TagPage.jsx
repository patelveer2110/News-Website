import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { backendURL } from "../App";
import PostCard from "../components/PostCard";
import categories from '../constants/categories'; // import your categories list

const TagPage = () => {
    const { tag } = useParams();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("All");

    useEffect(() => {
        const fetchTaggedPosts = async () => {
            setLoading(true);
            try {
                const params = {};
                if (selectedCategory !== "All") {
                    params.category = selectedCategory;
                }
                // Assuming your backend supports category as a query param on tag route
                const response = await axios.get(`${backendURL}/api/post/tag/${tag}`, { params });
                setPosts(response.data);
            } catch (err) {
                console.error("Failed to fetch posts", err);
                setPosts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTaggedPosts();
    }, [tag, selectedCategory]);  // refetch when tag or category changes

return (
  <div className="p-4 max-w-7xl mx-auto">

    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
      <h2 className="text-2xl font-semibold mb-4 sm:mb-0">
        Posts tagged with #{tag}
      </h2>

      <div className="w-full sm:w-64">
        <select
          id="categories"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="select select-sm select-bordered w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl"
        >
          <option value="All">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
    </div>

    {loading ? (
      <p className="text-center text-gray-500">Loading posts...</p>
    ) : posts.length === 0 ? (
      <p className="text-center text-gray-400">No posts found.</p>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    )}

  </div>
);

};

export default TagPage;
