import { getUsers, addUser, getSession, setSession, clearSession } from './storage.js';

/**
 * Hardcoded admin credentials for fallback authentication.
 */
const HARDCODED_ADMIN = {
  id: 'admin-default-uuid',
  username: 'admin',
  displayName: 'Site Owner',
  password: 'admin123',
  role: 'admin',
};

/**
 * Authenticate a user by username and password.
 * Validates against the hardcoded admin and localStorage users.
 * Sets session on success.
 * @param {string} username - The username to authenticate.
 * @param {string} password - The password to authenticate.
 * @returns {{userId: string, username: string, role: string, displayName: string} | null} The session object or null if authentication fails.
 */
export function login(username, password) {
  try {
    if (!username || !password) {
      return null;
    }

    // Check hardcoded admin first
    if (username === HARDCODED_ADMIN.username && password === HARDCODED_ADMIN.password) {
      const session = {
        userId: HARDCODED_ADMIN.id,
        username: HARDCODED_ADMIN.username,
        role: HARDCODED_ADMIN.role,
        displayName: HARDCODED_ADMIN.displayName,
      };
      setSession(session);
      return session;
    }

    // Check localStorage users
    const users = getUsers();
    const user = users.find((u) => u.username === username && u.password === password);

    if (!user) {
      return null;
    }

    const session = {
      userId: user.id,
      username: user.username,
      role: user.role,
      displayName: user.displayName,
    };
    setSession(session);
    return session;
  } catch {
    return null;
  }
}

/**
 * Register a new user with the 'user' role.
 * Saves the user to localStorage and sets the session.
 * @param {string} displayName - The display name for the new user.
 * @param {string} username - The username for the new user.
 * @param {string} password - The password for the new user.
 * @returns {{userId: string, username: string, role: string, displayName: string} | null} The session object or null if registration fails.
 */
export function register(displayName, username, password) {
  try {
    if (!displayName || !username || !password) {
      return null;
    }

    // Check if username already exists
    const users = getUsers();
    const exists = users.some((u) => u.username === username);
    if (exists) {
      return null;
    }

    // Prevent registering with the hardcoded admin username
    if (username === HARDCODED_ADMIN.username) {
      return null;
    }

    const newUser = {
      username,
      displayName,
      password,
      role: 'user',
    };

    addUser(newUser);

    // Retrieve the newly added user to get the generated ID
    const updatedUsers = getUsers();
    const createdUser = updatedUsers.find((u) => u.username === username);

    if (!createdUser) {
      return null;
    }

    const session = {
      userId: createdUser.id,
      username: createdUser.username,
      role: createdUser.role,
      displayName: createdUser.displayName,
    };
    setSession(session);
    return session;
  } catch {
    return null;
  }
}

/**
 * Log out the current user by clearing the session.
 */
export function logout() {
  clearSession();
}

/**
 * Check if the current session user has the admin role.
 * @returns {boolean} True if the current user is an admin, false otherwise.
 */
export function isAdmin() {
  try {
    const session = getSession();
    if (!session) {
      return false;
    }
    return session.role === 'admin';
  } catch {
    return false;
  }
}

/**
 * Get the current session user object.
 * @returns {{userId: string, username: string, role: string, displayName: string} | null} The current session or null if not logged in.
 */
export function getCurrentUser() {
  try {
    return getSession();
  } catch {
    return null;
  }
}