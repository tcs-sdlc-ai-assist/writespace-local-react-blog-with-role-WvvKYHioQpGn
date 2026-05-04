import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { getAvatar } from '../components/Avatar.jsx';
import { getCurrentUser } from '../utils/auth.js';
import { getPosts, deletePost } from '../utils/storage.js';

/**
 * Formats an ISO date string into a human-readable format.
 * @param {string} dateString - An ISO 8601 date string.
 * @returns {string} A formatted date string (e.g., "January 15, 2024").
 */
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

/**
 * Full blog post reading view page.
 * Displays full post content with title, author info, formatted date.
 * Shows edit and delete buttons based on role/ownership.
 * Delete shows confirmation dialog, removes post, redirects to /blogs.
 * Shows 'Post not found' for invalid/missing IDs.
 * @returns {JSX.Element}
 */
function ReadBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = getCurrentUser();

  const [post, setPost] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const posts = getPosts();
      const found = posts.find((p) => p.id === id);

      if (!found) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setPost(found);
      setLoading(false);
    } catch {
      setNotFound(true);
      setLoading(false);
    }
  }, [id]);

  const canEdit =
    session &&
    post &&
    (session.role === 'admin' || session.userId === post.authorId);

  const canDelete =
    session &&
    post &&
    (session.role === 'admin' || session.userId === post.authorId);

  function handleDeleteClick() {
    setConfirmingDelete(true);
  }

  function handleConfirmDelete() {
    try {
      deletePost(post.id);
      navigate('/blogs', { replace: true });
    } catch {
      setConfirmingDelete(false);
    }
  }

  function handleCancelDelete() {
    setConfirmingDelete(false);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-surface">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <svg
              className="animate-spin h-8 w-8 text-primary-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}

        {/* Not Found State */}
        {!loading && notFound && (
          <div className="flex flex-col items-center justify-center py-20 sm:py-28">
            <span
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-surface-100 text-4xl mb-6 select-none"
              aria-hidden="true"
            >
              🔍
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-surface-800 mb-3">
              Post not found
            </h2>
            <p className="text-surface-500 text-sm sm:text-base mb-8 text-center max-w-md">
              The post you&apos;re looking for doesn&apos;t exist or may have been deleted.
            </p>
            <Link
              to="/blogs"
              className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-primary text-white text-sm font-semibold shadow-primary hover:opacity-90 transition-opacity"
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
                  d="M11 17l-5-5m0 0l5-5m-5 5h12"
                />
              </svg>
              Back to Blogs
            </Link>
          </div>
        )}

        {/* Post Content */}
        {!loading && !notFound && post && (
          <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6 sm:p-8">
            {/* Back Link */}
            <Link
              to="/blogs"
              className="inline-flex items-center text-sm font-medium text-surface-500 hover:text-primary-600 transition-colors mb-6"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 17l-5-5m0 0l5-5m-5 5h12"
                />
              </svg>
              Back to Blogs
            </Link>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-surface-800 mb-4 leading-tight">
              {post.title}
            </h1>

            {/* Author and Date */}
            <div className="flex items-center justify-between gap-3 mb-8 pb-6 border-b border-surface-200">
              <div className="flex items-center gap-3 min-w-0">
                {getAvatar(post.authorRole || 'user')}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-surface-700 truncate">
                    {post.authorName}
                  </p>
                  <time
                    dateTime={post.createdAt}
                    className="text-xs text-surface-400"
                  >
                    {formatDate(post.createdAt)}
                  </time>
                </div>
              </div>

              {/* Action Buttons */}
              {(canEdit || canDelete) && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  {canEdit && (
                    <Link
                      to={`/edit/${post.id}`}
                      className="inline-flex items-center px-4 py-2 rounded-xl bg-surface-100 text-surface-600 text-sm font-semibold hover:bg-surface-200 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 mr-1.5"
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
                      Edit
                    </Link>
                  )}
                  {canDelete && !confirmingDelete && (
                    <button
                      type="button"
                      onClick={handleDeleteClick}
                      className="inline-flex items-center px-4 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 hover:text-red-700 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 mr-1.5"
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
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Delete Confirmation Dialog */}
            {confirmingDelete && (
              <div className="mb-8 px-4 py-4 rounded-xl bg-red-50 border border-red-200">
                <p className="text-sm font-medium text-red-700 mb-3">
                  Are you sure you want to delete this post? This action cannot be undone.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
                  >
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelDelete}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-surface-100 text-surface-600 text-sm font-semibold hover:bg-surface-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Full Content */}
            <div className="prose prose-surface max-w-none">
              <div className="text-surface-700 text-base sm:text-lg leading-relaxed whitespace-pre-wrap">
                {post.content}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ReadBlog;