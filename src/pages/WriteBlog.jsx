import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Navbar from '../components/Navbar.jsx';
import { getCurrentUser } from '../utils/auth.js';
import { getPosts, addPost, updatePost } from '../utils/storage.js';

/**
 * Blog post creation and editing page.
 * Create mode (/write): generates UUID, sets author from session, saves new post, redirects to /blogs/:id.
 * Edit mode (/edit/:id): loads post by ID, pre-fills form, enforces ownership, updates post, redirects to /blogs/:id.
 * Fields: title (required), content (required with character counter).
 * Cancel button navigates back without saving.
 * @returns {JSX.Element}
 */
function WriteBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = getCurrentUser();

  const isEditMode = Boolean(id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    try {
      const posts = getPosts();
      const post = posts.find((p) => p.id === id);

      if (!post) {
        setError('Post not found.');
        setInitialLoading(false);
        return;
      }

      // Enforce ownership: user can only edit own posts; admin can edit any
      if (session && session.role !== 'admin' && session.userId !== post.authorId) {
        navigate('/blogs', { replace: true });
        return;
      }

      setTitle(post.title);
      setContent(post.content);
      setInitialLoading(false);
    } catch {
      setError('Failed to load post.');
      setInitialLoading(false);
    }
  }, [id, isEditMode, session, navigate]);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    if (!content.trim()) {
      setError('Content is required.');
      return;
    }

    if (!session) {
      setError('You must be logged in to publish a post.');
      return;
    }

    setLoading(true);

    try {
      if (isEditMode) {
        // Update existing post
        const posts = getPosts();
        const existingPost = posts.find((p) => p.id === id);

        if (!existingPost) {
          setError('Post not found.');
          setLoading(false);
          return;
        }

        // Re-check ownership
        if (session.role !== 'admin' && session.userId !== existingPost.authorId) {
          setError('You do not have permission to edit this post.');
          setLoading(false);
          return;
        }

        updatePost({
          id: existingPost.id,
          title: title.trim(),
          content: content.trim(),
          excerpt: content.trim().substring(0, 150),
          authorId: existingPost.authorId,
          authorName: existingPost.authorName,
          authorRole: existingPost.authorRole,
          createdAt: existingPost.createdAt,
        });

        navigate(`/blogs/${existingPost.id}`, { replace: true });
      } else {
        // Create new post
        const newId = uuidv4();

        addPost({
          id: newId,
          title: title.trim(),
          content: content.trim(),
          excerpt: content.trim().substring(0, 150),
          authorId: session.userId,
          authorName: session.displayName,
          authorRole: session.role,
          createdAt: new Date().toISOString(),
        });

        navigate(`/blogs/${newId}`, { replace: true });
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  }

  function handleCancel() {
    navigate(-1);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-surface">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-800">
            {isEditMode ? 'Edit Post' : 'Write a New Post'}
          </h1>
          <p className="text-surface-500 text-sm sm:text-base mt-1">
            {isEditMode
              ? 'Update your post below'
              : 'Share your thoughts with the community'}
          </p>
        </div>

        {/* Loading State for Edit Mode */}
        {initialLoading ? (
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
        ) : (
          <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6 sm:p-8">
            {/* Error Message */}
            {error && (
              <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-surface-700 mb-1.5"
                >
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your post title"
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50 text-surface-800 placeholder-surface-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
              </div>

              {/* Content */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="content"
                    className="block text-sm font-medium text-surface-700"
                  >
                    Content
                  </label>
                  <span className="text-xs text-surface-400">
                    {content.length} character{content.length === 1 ? '' : 's'}
                  </span>
                </div>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your post content here..."
                  rows={12}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50 text-surface-800 placeholder-surface-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-y"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center px-5 py-2.5 rounded-xl bg-surface-100 text-surface-600 text-sm font-semibold hover:bg-surface-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-white text-sm font-semibold shadow-primary transition-opacity ${
                    loading
                      ? 'bg-gradient-primary opacity-70 cursor-not-allowed'
                      : 'bg-gradient-primary hover:opacity-90'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      {isEditMode ? 'Updating…' : 'Publishing…'}
                    </>
                  ) : isEditMode ? (
                    'Update Post'
                  ) : (
                    'Publish Post'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default WriteBlog;