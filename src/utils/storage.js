import { v4 as uuidv4 } from 'uuid';

const KEYS = {
  USERS: 'ws_users',
  POSTS: 'ws_posts',
  SESSION: 'ws_session',
};

const HARDCODED_ADMIN = {
  id: 'admin-default-uuid',
  username: 'admin',
  displayName: 'Site Owner',
  password: 'admin123',
  role: 'admin',
};

/**
 * Safely parse JSON from localStorage.
 * @param {string} key - The localStorage key to read.
 * @param {*} fallback - The fallback value if parsing fails.
 * @returns {*} The parsed value or the fallback.
 */
function safeGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) {
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * Safely stringify and set a value in localStorage.
 * @param {string} key - The localStorage key to write.
 * @param {*} value - The value to store.
 */
function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Silently fail if localStorage is unavailable or full
  }
}

/**
 * Ensures the hardcoded admin user exists in the users array.
 */
function ensureAdmin() {
  const users = safeGet(KEYS.USERS, []);
  const adminExists = users.some(
    (u) => u.username === HARDCODED_ADMIN.username && u.role === 'admin'
  );
  if (!adminExists) {
    users.push({ ...HARDCODED_ADMIN });
    safeSet(KEYS.USERS, users);
  }
}

// Initialize admin on module load
ensureAdmin();

/**
 * Get all users from localStorage.
 * @returns {Array<{id: string, username: string, displayName: string, password: string, role: string}>}
 */
export function getUsers() {
  try {
    const users = safeGet(KEYS.USERS, []);
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

/**
 * Add a new user to localStorage.
 * @param {{id?: string, username: string, displayName: string, password: string, role?: string}} user
 */
export function addUser(user) {
  try {
    const users = getUsers();
    const newUser = {
      id: user.id || uuidv4(),
      username: user.username,
      displayName: user.displayName,
      password: user.password,
      role: user.role || 'user',
    };
    users.push(newUser);
    safeSet(KEYS.USERS, users);
  } catch {
    // Silently fail
  }
}

/**
 * Delete a user by ID from localStorage.
 * @param {string} userId - The ID of the user to delete.
 */
export function deleteUser(userId) {
  try {
    const users = getUsers();
    const filtered = users.filter((u) => u.id !== userId);
    safeSet(KEYS.USERS, filtered);
  } catch {
    // Silently fail
  }
}

/**
 * Get all posts from localStorage.
 * @returns {Array<{id: string, title: string, content: string, excerpt: string, authorId: string, authorName: string, authorRole: string, createdAt: string}>}
 */
export function getPosts() {
  try {
    const posts = safeGet(KEYS.POSTS, []);
    return Array.isArray(posts) ? posts : [];
  } catch {
    return [];
  }
}

/**
 * Add a new post to localStorage.
 * @param {{id?: string, title: string, content: string, excerpt?: string, authorId: string, authorName: string, authorRole?: string, createdAt?: string}} post
 */
export function addPost(post) {
  try {
    const posts = getPosts();
    const newPost = {
      id: post.id || uuidv4(),
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || post.content.substring(0, 150),
      authorId: post.authorId,
      authorName: post.authorName,
      authorRole: post.authorRole || 'user',
      createdAt: post.createdAt || new Date().toISOString(),
    };
    posts.push(newPost);
    safeSet(KEYS.POSTS, posts);
  } catch {
    // Silently fail
  }
}

/**
 * Update an existing post in localStorage.
 * @param {{id: string, title: string, content: string, excerpt?: string, authorId: string, authorName: string, authorRole?: string, createdAt?: string}} post
 */
export function updatePost(post) {
  try {
    const posts = getPosts();
    const index = posts.findIndex((p) => p.id === post.id);
    if (index !== -1) {
      posts[index] = {
        ...posts[index],
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || post.content.substring(0, 150),
        authorId: post.authorId !== undefined ? post.authorId : posts[index].authorId,
        authorName: post.authorName !== undefined ? post.authorName : posts[index].authorName,
        authorRole: post.authorRole !== undefined ? post.authorRole : posts[index].authorRole,
        createdAt: posts[index].createdAt,
      };
      safeSet(KEYS.POSTS, posts);
    }
  } catch {
    // Silently fail
  }
}

/**
 * Delete a post by ID from localStorage.
 * @param {string} postId - The ID of the post to delete.
 */
export function deletePost(postId) {
  try {
    const posts = getPosts();
    const filtered = posts.filter((p) => p.id !== postId);
    safeSet(KEYS.POSTS, filtered);
  } catch {
    // Silently fail
  }
}

/**
 * Get the current session from localStorage.
 * @returns {{userId: string, username: string, role: string, displayName: string} | null}
 */
export function getSession() {
  try {
    const session = safeGet(KEYS.SESSION, null);
    if (session && session.userId && session.username && session.role) {
      return session;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Set the current session in localStorage.
 * @param {{userId: string, username: string, role: string, displayName: string}} session
 */
export function setSession(session) {
  try {
    safeSet(KEYS.SESSION, {
      userId: session.userId,
      username: session.username,
      role: session.role,
      displayName: session.displayName,
    });
  } catch {
    // Silently fail
  }
}

/**
 * Clear the current session from localStorage.
 */
export function clearSession() {
  try {
    localStorage.removeItem(KEYS.SESSION);
  } catch {
    // Silently fail
  }
}