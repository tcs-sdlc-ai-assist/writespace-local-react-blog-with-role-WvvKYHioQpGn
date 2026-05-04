import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import UserRow from '../components/UserRow.jsx';
import { getCurrentUser } from '../utils/auth.js';
import { getUsers, addUser, deleteUser } from '../utils/storage.js';

/**
 * Admin-only user management page at /admin/users.
 * Displays a create user form with display name, username, password, and role dropdown.
 * Validates username uniqueness before creating.
 * Lists all users in a responsive table (desktop) or cards (mobile) using UserRow components.
 * Delete with confirmation; hardcoded admin is undeletable; logged-in user cannot delete self.
 * Uses Navbar for authenticated navigation.
 * @returns {JSX.Element}
 */
function UserManagement() {
  const session = getCurrentUser();

  const [users, setUsers] = useState(() => getUsers());

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!displayName.trim()) {
      setError('Display name is required.');
      return;
    }

    if (!username.trim()) {
      setError('Username is required.');
      return;
    }

    if (!password) {
      setError('Password is required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    // Check username uniqueness
    const currentUsers = getUsers();
    const usernameExists = currentUsers.some((u) => u.username === username.trim());
    if (usernameExists) {
      setError('Username is already taken. Please choose another.');
      return;
    }

    setLoading(true);

    try {
      addUser({
        username: username.trim(),
        displayName: displayName.trim(),
        password,
        role,
      });

      setUsers(getUsers());
      setDisplayName('');
      setUsername('');
      setPassword('');
      setRole('user');
      setSuccess(`User "${displayName.trim()}" created successfully.`);
      setLoading(false);
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  }

  function handleDeleteUser(userId) {
    try {
      deleteUser(userId);
      setUsers(getUsers());
      setSuccess('User deleted successfully.');
      setError('');
    } catch {
      setError('Failed to delete user.');
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-surface">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-surface-800">
              User Management
            </h1>
            <p className="text-surface-500 text-sm sm:text-base mt-1">
              {users.length} user{users.length === 1 ? '' : 's'} registered
            </p>
          </div>
          <Link
            to="/admin"
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
                d="M11 17l-5-5m0 0l5-5m-5 5h12"
              />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Create User Form */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6 sm:p-8 mb-8">
          <h2 className="text-lg font-bold text-surface-800 mb-6">
            Create New User
          </h2>

          {/* Error Message */}
          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Display Name */}
              <div>
                <label
                  htmlFor="displayName"
                  className="block text-sm font-medium text-surface-700 mb-1.5"
                >
                  Display Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter display name"
                  autoComplete="name"
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50 text-surface-800 placeholder-surface-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
              </div>

              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-surface-700 mb-1.5"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  autoComplete="username"
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50 text-surface-800 placeholder-surface-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-surface-700 mb-1.5"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50 text-surface-800 placeholder-surface-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
              </div>

              {/* Role */}
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-surface-700 mb-1.5"
                >
                  Role
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50 text-surface-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
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
                    Creating…
                  </>
                ) : (
                  <>
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
                    Create User
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* User List */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card">
          <div className="px-5 sm:px-6 py-4 border-b border-surface-200">
            <h2 className="text-lg font-bold text-surface-800">
              All Users
            </h2>
          </div>

          {users.length > 0 ? (
            <>
              {/* Desktop Table */}
              <table className="hidden md:table w-full">
                <thead>
                  <tr className="border-b border-surface-200 bg-surface-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-surface-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      onDelete={handleDeleteUser}
                    />
                  ))}
                </tbody>
              </table>

              {/* Mobile Cards */}
              <div className="md:hidden p-4">
                {users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onDelete={handleDeleteUser}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16">
              <span
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface-100 text-3xl mb-4 select-none"
                aria-hidden="true"
              >
                👥
              </span>
              <h3 className="text-lg font-bold text-surface-800 mb-2">
                No users found
              </h3>
              <p className="text-surface-500 text-sm mb-6 text-center max-w-sm">
                Create your first user using the form above.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default UserManagement;