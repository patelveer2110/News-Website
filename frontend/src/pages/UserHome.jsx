import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import PostCard from '../components/PostCard';
import { backendURL } from '../App';
import categories from '../constants/categories';

// Spinner component using Tailwind CSS
const Spinner = () => (
  <div className="flex justify-center py-4">
    <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
  </div>
);

const UserHome = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Refs to hold latest loading and hasMore states for scroll event
  const loadingRef = useRef(loading);
  const hasMoreRef = useRef(hasMore);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

const fetchPosts = async (pageNum = 1, reset = false) => {
  setLoading(true);
  try {
    // Dynamic limit based on screen width
    let limit = 3; // default for small screens

    if (window.innerWidth >= 1024) { // large screens (lg)
      limit = 9;
    } else if (window.innerWidth >= 640) { // medium screens (sm/md)
      limit = 6;
    }

    const params = { page: pageNum, limit };

    if (selectedCategory !== "All") {
      params.category = selectedCategory;
    }

    const res = await axios.get(`${backendURL}/api/post`, { params });

    if (Array.isArray(res.data)) {
      if (reset) {
        setPosts(res.data);
      } else {
        setPosts((prev) => [...prev, ...res.data]);
      }

      if (res.data.length < params.limit) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } else {
      if (reset) setPosts([]);
      setHasMore(false);
    }
  } catch (err) {
    console.error("Failed to fetch posts:", err);
    setHasMore(false);
  } finally {
    setLoading(false);
  }
};



  // Reset posts on category change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchPosts(1, true);
  }, [selectedCategory]);

  // Fetch posts when page changes (except for first page handled above)
  useEffect(() => {
    if (page !== 1) {
      fetchPosts(page);
    }
  }, [page]);

  // Infinite scroll with debounce and stable refs
  useEffect(() => {
    let debounceTimeout = null;

    const handleScroll = () => {
      if (debounceTimeout) clearTimeout(debounceTimeout);

      debounceTimeout = setTimeout(() => {
        if (
          window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
          !loadingRef.current &&
          hasMoreRef.current
        ) {
          setPage((prev) => prev + 1);
        }
      }, 150);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (debounceTimeout) clearTimeout(debounceTimeout);
    };
  }, []);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <h1 className="text-2xl font-bold mb-2 sm:mb-0">Latest News</h1>
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

      {posts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
          {loading && <Spinner />}
          {!hasMore && (
            <div className="text-center text-gray-400 mt-4">No more posts.</div>
          )}
        </>
      ) : (
        <div className="text-center text-gray-400">
          {loading ? <Spinner /> : "No posts found."}
        </div>
      )}
    </div>
  );
};

export default UserHome;
