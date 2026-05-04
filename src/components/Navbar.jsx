import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../utils/auth.js';
import { getAvatar } from './Avatar.jsx';

/**
 * Authenticated navigation bar component.
 * Displays 'WriteSpace' brand, navigation links (Blogs, Write, and Admin Dashboard for admins),
 * avatar chip with user display name and role, and Logout button.
 * Responsive with mobile hamburger menu.
 * Logout calls auth.logout() and redirects to landing page.
 * @returns {JSX.Element}
 */
function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const session = getCurrentUser();

  function handleLogout() {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  }

  function handleToggleMobile() {
    setMobileMenuOpen((prev) => !prev);
  }

  function closeMobile() {
    setMobileMenuOpen(false);
  }

  return (
    <nav className="bg-white border-b border-surface-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold bg-gradient-primary bg-clip-text text-transparent select-none"
            onClick={closeMobile}
          >
            ✍️ WriteSpace
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/blogs"
              className="text-surface-600 hover:text-primary-600 font-medium transition-colors"
            >
              Blogs
            </Link>
            <Link
              to="/write"
              className="text-surface-600 hover:text-primary-600 font-medium transition-colors"
            >
              Write
            </Link>
            {session && session.role === 'admin' && (
              <Link
                to="/admin"
                className="text-surface-600 hover:text-primary-600 font-medium transition-colors"
              >
                Dashboard
              </Link>
            )}
            {session && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-100">
                {getAvatar(session.role)}
                <span className="text-sm font-medium text-surface-700">
                  {session.displayName}
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm text-surface-500 hover:text-red-600 font-medium transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-surface-500 hover:text-primary-600 hover:bg-surface-100 transition-colors"
            onClick={handleToggleMobile}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-surface-200 bg-white">
          <div className="px-4 py-4 space-y-3">
            {session && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-100">
                {getAvatar(session.role)}
                <span className="text-sm font-medium text-surface-700">
                  {session.displayName}
                </span>
              </div>
            )}
            <Link
              to="/blogs"
              className="block px-3 py-2 rounded-xl text-surface-600 hover:bg-surface-100 hover:text-primary-600 font-medium transition-colors"
              onClick={closeMobile}
            >
              Blogs
            </Link>
            <Link
              to="/write"
              className="block px-3 py-2 rounded-xl text-surface-600 hover:bg-surface-100 hover:text-primary-600 font-medium transition-colors"
              onClick={closeMobile}
            >
              Write
            </Link>
            {session && session.role === 'admin' && (
              <Link
                to="/admin"
                className="block px-3 py-2 rounded-xl text-surface-600 hover:bg-surface-100 hover:text-primary-600 font-medium transition-colors"
                onClick={closeMobile}
              >
                Dashboard
              </Link>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="block w-full text-left px-3 py-2 rounded-xl text-surface-500 hover:bg-red-50 hover:text-red-600 font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;