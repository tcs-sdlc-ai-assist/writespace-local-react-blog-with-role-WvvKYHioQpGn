import { Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar.jsx';
import { getPosts } from '../utils/storage.js';
import { getCurrentUser } from '../utils/auth.js';

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
function truncate(text, maxLength = 120) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trimEnd() + '…';
}

/**
 * Feature card data for the features section.
 */
const FEATURES = [
  {
    icon: '🔐',
    title: 'Role-Based Access',
    description:
      'Secure authentication with distinct admin and user roles. Admins manage users and content, while users focus on writing.',
  },
  {
    icon: '✍️',
    title: 'Easy Blogging',
    description:
      'Create, edit, and share your blog posts effortlessly. A clean writing experience that lets you focus on your ideas.',
  },
  {
    icon: '📊',
    title: 'Admin Dashboard',
    description:
      'Powerful admin tools to manage users, monitor posts, and keep your blog community running smoothly.',
  },
];

/**
 * Public landing page component.
 * Displays hero section with gradient background, features section,
 * latest posts preview, and footer.
 * @returns {JSX.Element}
 */
function LandingPage() {
  const session = getCurrentUser();
  const allPosts = getPosts();
  const latestPosts = [...allPosts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-surface">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-accent opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-600/20 via-transparent to-indigo-600/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Your Space to Write, Share &amp; Inspire
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mb-10 leading-relaxed">
              WriteSpace is a modern blogging platform where ideas come to life.
              Create beautiful posts, connect with readers, and build your writing community.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-3.5 rounded-2xl bg-white text-primary-700 text-base font-semibold shadow-primary hover:bg-surface-50 transition-colors"
              >
                Get Started
                <svg
                  className="w-5 h-5 ml-2"
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
              <Link
                to="/login"
                className="inline-flex items-center px-8 py-3.5 rounded-2xl bg-white/10 text-white text-base font-semibold border border-white/20 hover:bg-white/20 transition-colors"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-surface-800 mb-4">
            Everything You Need
          </h2>
          <p className="text-surface-500 text-lg max-w-2xl mx-auto">
            WriteSpace comes packed with features to make blogging simple, secure, and enjoyable.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl border border-surface-200 shadow-card hover:shadow-card-hover transition-shadow duration-200 p-6 sm:p-8 text-center"
            >
              <span
                className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-primary text-2xl mb-5 select-none"
                aria-hidden="true"
              >
                {feature.icon}
              </span>
              <h3 className="text-xl font-bold text-surface-800 mb-3">
                {feature.title}
              </h3>
              <p className="text-surface-500 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Posts Section */}
      {latestPosts.length > 0 && (
        <section className="bg-surface-50 border-t border-surface-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-surface-800 mb-4">
                Latest Posts
              </h2>
              <p className="text-surface-500 text-lg max-w-2xl mx-auto">
                See what our community has been writing about.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {latestPosts.map((post) => {
                const linkTo = session ? `/blogs/${post.id}` : '/login';
                return (
                  <Link
                    key={post.id}
                    to={linkTo}
                    className="block bg-white rounded-2xl border border-surface-200 border-l-4 border-l-primary-500 shadow-card hover:shadow-card-hover transition-shadow duration-200 p-5 sm:p-6"
                  >
                    <h3 className="text-lg font-bold text-surface-800 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-surface-500 text-sm leading-relaxed mb-4">
                      {truncate(post.excerpt || post.content, 120)}
                    </p>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-surface-700 truncate">
                        {post.authorName}
                      </span>
                      <time
                        dateTime={post.createdAt}
                        className="text-xs text-surface-400 whitespace-nowrap"
                      >
                        {formatDate(post.createdAt)}
                      </time>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="text-center mt-10">
              <Link
                to={session ? '/blogs' : '/login'}
                className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-primary text-white text-sm font-semibold shadow-primary hover:opacity-90 transition-opacity"
              >
                View All Posts
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
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="mt-auto bg-surface-800 text-surface-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <Link
                to="/"
                className="text-xl font-bold text-white select-none"
              >
                ✍️ WriteSpace
              </Link>
              <p className="mt-3 text-sm text-surface-400 leading-relaxed">
                Your space to write, share, and inspire. A modern blogging platform for everyone.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/login"
                    className="text-sm text-surface-400 hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="text-sm text-surface-400 hover:text-white transition-colors"
                  >
                    Register
                  </Link>
                </li>
                <li>
                  <Link
                    to={session ? '/blogs' : '/login'}
                    className="text-sm text-surface-400 hover:text-white transition-colors"
                  >
                    Blogs
                  </Link>
                </li>
              </ul>
            </div>

            {/* About */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                About
              </h4>
              <p className="text-sm text-surface-400 leading-relaxed">
                WriteSpace is built with React and Tailwind CSS. All data is stored locally in your browser using localStorage.
              </p>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-surface-700 text-center">
            <p className="text-sm text-surface-400">
              © {new Date().getFullYear()} WriteSpace. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;