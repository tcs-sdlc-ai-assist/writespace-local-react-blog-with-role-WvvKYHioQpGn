import PropTypes from 'prop-types';
import { useState } from 'react';
import { getCurrentUser } from '../utils/auth.js';
import { getAvatar } from './Avatar.jsx';

/**
 * Hardcoded admin user ID that cannot be deleted.
 */
const HARDCODED_ADMIN_ID = 'admin-default-uuid';

/**
 * User row/card component for admin user management.
 * Displays user avatar, display name, username, role badge pill.
 * Shows delete button with confirmation dialog.
 * Delete is disabled for the hardcoded admin and the currently logged-in user.
 * Responsive: table row on desktop, card on mobile.
 * @param {object} props
 * @param {object} props.user - The user object to display.
 * @param {string} props.user.id - The user's unique ID.
 * @param {string} props.user.username - The user's username.
 * @param {string} props.user.displayName - The user's display name.
 * @param {'admin' | 'user'} props.user.role - The user's role.
 * @param {function} props.onDelete - Callback invoked with user ID when delete is confirmed.
 * @returns {JSX.Element}
 */
function UserRow({ user, onDelete }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const session = getCurrentUser();

  const isHardcodedAdmin = user.id === HARDCODED_ADMIN_ID;
  const isCurrentUser = session && session.userId === user.id;
  const deleteDisabled = isHardcodedAdmin || isCurrentUser;

  function handleDeleteClick() {
    setConfirmingDelete(true);
  }

  function handleConfirmDelete() {
    setConfirmingDelete(false);
    onDelete(user.id);
  }

  function handleCancelDelete() {
    setConfirmingDelete(false);
  }

  const roleBadge =
    user.role === 'admin' ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-700">
        Admin
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
        User
      </span>
    );

  return (
    <>
      {/* Desktop: Table Row */}
      <tr className="hidden md:table-row border-b border-surface-200 hover:bg-surface-50 transition-colors">
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            {getAvatar(user.role)}
            <div className="min-w-0">
              <p className="text-sm font-medium text-surface-800 truncate">
                {user.displayName}
              </p>
              <p className="text-xs text-surface-400 truncate">
                @{user.username}
              </p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          {roleBadge}
        </td>
        <td className="px-4 py-3 text-right">
          {confirmingDelete ? (
            <div className="flex items-center justify-end gap-2">
              <span className="text-xs text-surface-500">Are you sure?</span>
              <button
                type="button"
                onClick={handleConfirmDelete}
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
            <button
              type="button"
              onClick={handleDeleteClick}
              disabled={deleteDisabled}
              className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                deleteDisabled
                  ? 'bg-surface-100 text-surface-300 cursor-not-allowed'
                  : 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700'
              }`}
              title={
                isHardcodedAdmin
                  ? 'Cannot delete the default admin'
                  : isCurrentUser
                    ? 'Cannot delete your own account'
                    : `Delete ${user.displayName}`
              }
            >
              <svg
                className="w-3.5 h-3.5 mr-1"
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
        </td>
      </tr>

      {/* Mobile: Card */}
      <div className="md:hidden bg-white rounded-2xl border border-surface-200 shadow-card p-4 mb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {getAvatar(user.role)}
            <div className="min-w-0">
              <p className="text-sm font-medium text-surface-800 truncate">
                {user.displayName}
              </p>
              <p className="text-xs text-surface-400 truncate">
                @{user.username}
              </p>
            </div>
          </div>
          {roleBadge}
        </div>

        <div className="mt-3 flex justify-end">
          {confirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-surface-500">Are you sure?</span>
              <button
                type="button"
                onClick={handleConfirmDelete}
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
            <button
              type="button"
              onClick={handleDeleteClick}
              disabled={deleteDisabled}
              className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                deleteDisabled
                  ? 'bg-surface-100 text-surface-300 cursor-not-allowed'
                  : 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700'
              }`}
              title={
                isHardcodedAdmin
                  ? 'Cannot delete the default admin'
                  : isCurrentUser
                    ? 'Cannot delete your own account'
                    : `Delete ${user.displayName}`
              }
            >
              <svg
                className="w-3.5 h-3.5 mr-1"
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
      </div>
    </>
  );
}

UserRow.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    role: PropTypes.oneOf(['admin', 'user']).isRequired,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default UserRow;