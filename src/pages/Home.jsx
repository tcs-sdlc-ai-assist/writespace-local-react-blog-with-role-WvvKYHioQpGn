import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import BlogCard from '../components/BlogCard.jsx';
import { getPosts } from '../utils/storage.js';

/**
 * Authenticated blog listing page.
 * Displays all posts in a responsive grid sorted newest first.
 * Shows empty state with CTA to write first post when no posts exist.
 * Uses Navbar for authenticated navigation.
 * @returns {JSX.Element}
 */
function Home() {
  const allPosts = getPosts();
  const sortedPosts = [...allPosts].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-surface">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-surface-800">
              All Posts
            </h1>
            <p className="text-surface-500 text-sm sm:text-base mt-1">
              {sortedPosts.length > 0
                ? `${sortedPosts.length} post${sortedPosts.length === 1 ? '' : 's'} published`
                : 'No posts published yet'}
            </p>
          </div>
          <Link
            to="/write"
            className="inline-flex items-center px-5 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-semibold shadow-primary hover:opacity-90 transition-opacity"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Write
          </Link>
        </div>

        {/* Posts Grid or Empty State */}
        {sortedPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 sm:py-28">
            <span
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-surface-100 text-4xl mb-6 select-none"
              aria-hidden="true"
            >
              ✍️
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-surface-800 mb-3">
              No posts yet
            </h2>
            <p className="text-surface-500 text-sm sm:text-base mb-8 text-center max-w-md">
              Be the first to share your thoughts! Create a new post and start building your writing community.
            </p>
            <Link
              to="/write"
              className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-primary text-white text-sm font-semibold shadow-primary hover:opacity-90 transition-opacity"
            >
              Write Your First Post
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;