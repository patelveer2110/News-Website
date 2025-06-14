import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import PostCard from '../components/PostCard';
import { backendURL } from '../App';
import categories from '../constants/categories';
import { userAuth } from '../hooks/userAuth'; // assuming this gives you userId

const Spinner = () => (
  <div className="flex justify-center py-4">
    <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
  </div>
);

const sortOptions = [
  { label: "Latest", value: "latest" },
  { label: "Most Liked", value: "liked" },
  { label: "Most Viewed", value: "viewed" },
  { label: "Most Rated", value: "rated" },
];

const UserHome = () => {
  const { userId } = userAuth() || {};
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadingRef = useRef(loading);
  const hasMoreRef = useRef(hasMore);

  useEffect(() => { loadingRef.current = loading }, [loading]);
  useEffect(() => { hasMoreRef.current = hasMore }, [hasMore]);

  const fetchPosts = async (pageNum = 1, reset = false) => {
  setLoading(true);
  try {
    let limit = 3;
    if (window.innerWidth >= 1024) limit = 9;
    else if (window.innerWidth >= 640) limit = 6;

    const params = {
      page: pageNum,
      limit,
      sort,
      userId,
    };

    if (selectedCategory !== "All") params.category = selectedCategory;

    const res = await axios.get(`${backendURL}/api/post`, { params });

    const { label, posts: newPosts = [] } = res.data;

    // Optional: Display label somewhere in your UI
    // setSectionLabel?.(label); // Only if you have this hook or prop

    if (reset) {
      setPosts(newPosts);
    } else {
      setPosts((prev) => [...prev, ...newPosts]);
    }

    setHasMore(newPosts.length >= limit);
  } catch (err) {
    console.error("Failed to fetch posts:", err);
    setHasMore(false);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchPosts(1, true);
  }, [selectedCategory, sort]);

  useEffect(() => {
    if (page !== 1) {
      fetchPosts(page);
    }
  }, [page]);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h1 className="text-2xl font-bold">Latest News</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="select select-sm select-bordered w-full"
          >
            <option value="All">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="select select-sm select-bordered w-full"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
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
            <div className="text-center text-base-content/60 mt-4">No more posts.</div>
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
