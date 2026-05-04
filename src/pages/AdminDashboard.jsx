import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import StatCard from '../components/StatCard.jsx';
import { getAvatar } from '../components/Avatar.jsx';
import { getCurrentUser } from '../utils/auth.js';
import { getPosts, getUsers, deletePost } from '../utils/storage.js';

/**
 * Formats an ISO date string into a human-readable format.
 * @param {string} dateString - An ISO 8601 date string.
 * @returns {string} A formatted date string (e.g., "Jan 15, 2024").
 */
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

/**
 * Truncates text to a maximum length and appends ellipsis if needed.
 * @param {string} text - The text to truncate.
 * @param {number} maxLength - The maximum character length.
 * @returns {string} The truncated text.
 */
function truncate(text, maxLength = 80) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trimEnd() + '…';
}

/**
 * Admin-only dashboard page at /admin.
 * Displays gradient banner header with welcome message.
 * Four StatCard components: total posts, total users, admin count, user count.
 * Quick action buttons: Write New Post (/write), Manage Users (/admin/users).
 * Recent posts section showing latest 5 posts with edit/delete controls.
 * Uses Navbar for authenticated navigation.
 * @returns {JSX.Element}
 */
function AdminDashboard() {
  const navigate = useNavigate();
  const session = getCurrentUser();

  const [posts, setPosts] = useState(() => getPosts());
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);

  const users = getUsers();

  const totalPosts = posts.length;
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const userCount = users.filter((u) => u.role === 'user').length;

  const recentPosts = [...posts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  function handleDeleteClick(postId) {
    setConfirmingDeleteId(postId);
  }

  function handleConfirmDelete(postId) {
    try {
      deletePost(postId);
      setPosts(getPosts());
      setConfirmingDeleteId(null);
    } catch {
      setConfirmingDeleteId(null);
    }
  }

  function handleCancelDelete() {
    setConfirmingDeleteId(null);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-surface">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Gradient Banner Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-accent p-6 sm:p-8 mb-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-600/20 via-transparent to-indigo-600/20" />
          <div className="relative">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Welcome back, {session ? session.displayName : 'Admin'} 👋
            </h1>
            <p className="text-white/80 text-sm sm:text-base">
              Here&apos;s an overview of your WriteSpace community.
            </p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <StatCard label="Total Posts" value={totalPosts} icon="📝" />
          <StatCard label="Total Users" value={totalUsers} icon="👥" />
          <StatCard label="Admins" value={adminCount} icon="👑" />
          <StatCard label="Users" value={userCount} icon="📖" />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
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
            Write New Post
          </Link>
          <Link
            to="/admin/users"
            className="inline-flex items-center px-5 py-2.5 rounded-xl bg-surface-100 text-surface-600 text-sm font-semibold hover:bg-surface-200 transition-colors"
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            Manage Users
          </Link>
        </div>

        {/* Recent Posts Section */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card">
          <div className="px-5 sm:px-6 py-4 border-b border-surface-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-surface-800">
                Recent Posts
              </h2>
              <Link
                to="/blogs"
                className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                View All
              </Link>
            </div>
          </div>

          {recentPosts.length > 0 ? (
            <div className="divide-y divide-surface-200">
              {recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="px-5 sm:px-6 py-4 hover:bg-surface-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/blogs/${post.id}`}
                        className="text-sm sm:text-base font-semibold text-surface-800 hover:text-primary-600 transition-colors line-clamp-1"
                      >
                        {post.title}
                      </Link>
                      <p className="text-surface-500 text-xs sm:text-sm mt-1 line-clamp-1">
                        {truncate(post.excerpt || post.content, 80)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {getAvatar(post.authorRole || 'user')}
                        <span className="text-xs font-medium text-surface-600 truncate">
                          {post.authorName}
                        </span>
                        <span className="text-xs text-surface-300">·</span>
                        <time
                          dateTime={post.createdAt}
                          className="text-xs text-surface-400 whitespace-nowrap"
                        >
                          {formatDate(post.createdAt)}
                        </time>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {confirmingDeleteId === post.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-surface-500 hidden sm:inline">
                            Sure?
                          </span>
                          <button
                            type="button"
                            onClick={() => handleConfirmDelete(post.id)}
                            className="inline-flex items-center px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelDelete}
                            className="inline-flex items-center px-3 py-1.5 rounded-lg bg-surface-100 text-surface-600 text-xs font-semibold hover:bg-surface-200 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <Link
                            to={`/edit/${post.id}`}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-surface-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                            aria-label={`Edit post: ${post.title}`}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(post.id)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            aria-label={`Delete post: ${post.title}`}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16">
              <span
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface-100 text-3xl mb-4 select-none"
                aria-hidden="true"
              >
                📝
              </span>
              <h3 className="text-lg font-bold text-surface-800 mb-2">
                No posts yet
              </h3>
              <p className="text-surface-500 text-sm mb-6 text-center max-w-sm">
                Get started by creating your first blog post.
              </p>
              <Link
                to="/write"
                className="inline-flex items-center px-5 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-semibold shadow-primary hover:opacity-90 transition-opacity"
              >
                Write Your First Post
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;