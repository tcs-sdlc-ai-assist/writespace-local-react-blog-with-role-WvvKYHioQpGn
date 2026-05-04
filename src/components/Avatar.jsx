import PropTypes from 'prop-types';

/**
 * Returns a styled avatar JSX element based on the user's role.
 * Admin gets a crown emoji with violet background; User gets a book emoji with indigo background.
 * @param {'admin' | 'user'} role - The role of the user.
 * @returns {JSX.Element} A small circular badge avatar element.
 */
export function getAvatar(role) {
  if (role === 'admin') {
    return (
      <span
        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-violet-100 text-violet-700 text-sm font-semibold select-none"
        aria-label="Admin avatar"
      >
        👑
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold select-none"
      aria-label="User avatar"
    >
      📖
    </span>
  );
}

/**
 * Avatar component that renders a role-distinct circular badge.
 * @param {object} props
 * @param {'admin' | 'user'} props.role - The role of the user.
 * @returns {JSX.Element}
 */
function Avatar({ role }) {
  return getAvatar(role);
}

Avatar.propTypes = {
  role: PropTypes.oneOf(['admin', 'user']),
};

Avatar.defaultProps = {
  role: 'user',
};

export default Avatar;