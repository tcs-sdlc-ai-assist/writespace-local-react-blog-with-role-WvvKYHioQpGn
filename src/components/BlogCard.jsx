import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../utils/auth.js';
import { getAvatar } from './Avatar.jsx';

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
function truncate(text, maxLength = 150) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trimEnd() + '…';
}

/**
 * Blog post summary card component.
 * Displays title, excerpt (truncated content), formatted date, author avatar and name.
 * Shows edit icon/link if current user is admin or is the post author.
 * Clicking card navigates to /blogs/:id.
 * @param {object} props
 * @param {object} props.post - The blog post object.
 * @param {string} props.post.id - The post ID.
 * @param {string} props.post.title - The post title.
 * @param {string} props.post.content - The full post content.
 * @param {string} [props.post.excerpt] - The post excerpt.
 * @param {string} props.post.authorId - The author's user ID.
 * @param {string} props.post.authorName - The author's display name.
 * @param {string} [props.post.authorRole] - The author's role.
 * @param {string} props.post.createdAt - The ISO date string of creation.
 * @returns {JSX.Element}
 */
function BlogCard({ post }) {
  const session = getCurrentUser();
  const canEdit =
    session &&
    (session.role === 'admin' || session.userId === post.authorId);

  const displayExcerpt = post.excerpt
    ? truncate(post.excerpt, 150)
    : truncate(post.content, 150);

  return (
    <div className="relative bg-white rounded-2xl border border-surface-200 border-l-4 border-l-primary-500 shadow-card hover:shadow-card-hover transition-shadow duration-200">
      <Link
        to={`/blogs/${post.id}`}
        className="block p-5 sm:p-6"
      >
        {/* Title */}
        <h3 className="text-lg sm:text-xl font-bold text-surface-800 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-surface-500 text-sm sm:text-base leading-relaxed mb-4">
          {displayExcerpt}
        </p>

        {/* Footer: Author + Date */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {getAvatar(post.authorRole || 'user')}
            <span className="text-sm font-medium text-surface-700 truncate">
              {post.authorName}
            </span>
          </div>
          <time
            dateTime={post.createdAt}
            className="text-xs text-surface-400 whitespace-nowrap"
          >
            {formatDate(post.createdAt)}
          </time>
        </div>
      </Link>

      {/* Edit button */}
      {canEdit && (
        <Link
          to={`/edit/${post.id}`}
          className="absolute top-4 right-4 inline-flex items-center justify-center w-8 h-8 rounded-lg text-surface-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
          aria-label={`Edit post: ${post.title}`}
          onClick={(e) => e.stopPropagation()}
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
      )}
    </div>
  );
}

BlogCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    excerpt: PropTypes.string,
    authorId: PropTypes.string.isRequired,
    authorName: PropTypes.string.isRequired,
    authorRole: PropTypes.string,
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
};

export default BlogCard;