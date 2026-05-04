import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/auth.js';

/**
 * Route guard component that checks authentication and role-based access.
 * @param {object} props
 * @param {React.ReactNode} props.children - The child components to render if authorized.
 * @param {'admin' | 'user'} [props.role] - Optional role requirement for the route.
 * @returns {JSX.Element} The children if authorized, or a Navigate redirect.
 */
function ProtectedRoute({ children, role }) {
  const session = getCurrentUser();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (role && session.role !== role) {
    return <Navigate to="/blogs" replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  role: PropTypes.oneOf(['admin', 'user']),
};

ProtectedRoute.defaultProps = {
  role: undefined,
};

export default ProtectedRoute;