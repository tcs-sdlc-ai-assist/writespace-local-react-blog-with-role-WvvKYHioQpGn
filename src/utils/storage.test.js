import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// We need to mock localStorage before importing storage.js,
// because storage.js runs ensureAdmin() on module load.

// Storage for our mock localStorage
let store = {};

const localStorageMock = {
  getItem: vi.fn((key) => {
    return key in store ? store[key] : null;
  }),
  setItem: vi.fn((key, value) => {
    store[key] = String(value);
  }),
  removeItem: vi.fn((key) => {
    delete store[key];
  }),
  clear: vi.fn(() => {
    store = {};
  }),
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

// Import storage functions after localStorage mock is in place
let getUsers, addUser, deleteUser, getPosts, addPost, updatePost, deletePost, getSession, setSession, clearSession;

beforeEach(async () => {
  store = {};
  vi.clearAllMocks();

  // Re-import the module fresh each time so ensureAdmin() runs against clean storage
  vi.resetModules();
  const mod = await import('./storage.js');
  getUsers = mod.getUsers;
  addUser = mod.addUser;
  deleteUser = mod.deleteUser;
  getPosts = mod.getPosts;
  addPost = mod.addPost;
  updatePost = mod.updatePost;
  deletePost = mod.deletePost;
  getSession = mod.getSession;
  setSession = mod.setSession;
  clearSession = mod.clearSession;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('storage.js', () => {
  // ─── Hardcoded Admin Initialization ───────────────────────────────────────

  describe('ensureAdmin on module load', () => {
    it('should initialize the hardcoded admin user in localStorage', () => {
      const users = getUsers();
      const admin = users.find((u) => u.username === 'admin');
      expect(admin).toBeDefined();
      expect(admin.id).toBe('admin-default-uuid');
      expect(admin.displayName).toBe('Site Owner');
      expect(admin.role).toBe('admin');
      expect(admin.password).toBe('admin123');
    });

    it('should not duplicate admin if already present', async () => {
      // Admin was already added by module load. Re-import again.
      vi.resetModules();
      const mod2 = await import('./storage.js');
      const users = mod2.getUsers();
      const admins = users.filter((u) => u.username === 'admin' && u.role === 'admin');
      expect(admins.length).toBe(1);
    });
  });

  // ─── getUsers ─────────────────────────────────────────────────────────────

  describe('getUsers', () => {
    it('should return an array of users including the hardcoded admin', () => {
      const users = getUsers();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThanOrEqual(1);
    });

    it('should return empty array when localStorage has corrupted data', () => {
      store['ws_users'] = 'not-valid-json{{{';
      const users = getUsers();
      expect(Array.isArray(users)).toBe(true);
      expect(users).toEqual([]);
    });

    it('should return empty array when localStorage has non-array JSON', () => {
      store['ws_users'] = JSON.stringify({ foo: 'bar' });
      const users = getUsers();
      expect(Array.isArray(users)).toBe(true);
      expect(users).toEqual([]);
    });
  });

  // ─── addUser ──────────────────────────────────────────────────────────────

  describe('addUser', () => {
    it('should add a new user with provided fields', () => {
      addUser({
        username: 'alice',
        displayName: 'Alice',
        password: 'password123',
        role: 'user',
      });

      const users = getUsers();
      const alice = users.find((u) => u.username === 'alice');
      expect(alice).toBeDefined();
      expect(alice.displayName).toBe('Alice');
      expect(alice.password).toBe('password123');
      expect(alice.role).toBe('user');
      expect(alice.id).toBeDefined();
      expect(typeof alice.id).toBe('string');
    });

    it('should generate a UUID if no id is provided', () => {
      addUser({
        username: 'bob',
        displayName: 'Bob',
        password: 'pass456',
      });

      const users = getUsers();
      const bob = users.find((u) => u.username === 'bob');
      expect(bob).toBeDefined();
      expect(bob.id).toBeDefined();
      expect(bob.id.length).toBeGreaterThan(0);
    });

    it('should use provided id if given', () => {
      addUser({
        id: 'custom-id-123',
        username: 'charlie',
        displayName: 'Charlie',
        password: 'pass789',
        role: 'admin',
      });

      const users = getUsers();
      const charlie = users.find((u) => u.username === 'charlie');
      expect(charlie).toBeDefined();
      expect(charlie.id).toBe('custom-id-123');
      expect(charlie.role).toBe('admin');
    });

    it('should default role to user if not provided', () => {
      addUser({
        username: 'dave',
        displayName: 'Dave',
        password: 'pass000',
      });

      const users = getUsers();
      const dave = users.find((u) => u.username === 'dave');
      expect(dave).toBeDefined();
      expect(dave.role).toBe('user');
    });
  });

  // ─── deleteUser ───────────────────────────────────────────────────────────

  describe('deleteUser', () => {
    it('should remove a user by ID', () => {
      addUser({
        id: 'user-to-delete',
        username: 'deleteme',
        displayName: 'Delete Me',
        password: 'pass',
        role: 'user',
      });

      let users = getUsers();
      expect(users.find((u) => u.id === 'user-to-delete')).toBeDefined();

      deleteUser('user-to-delete');

      users = getUsers();
      expect(users.find((u) => u.id === 'user-to-delete')).toBeUndefined();
    });

    it('should not affect other users when deleting', () => {
      addUser({
        id: 'keep-me',
        username: 'keeper',
        displayName: 'Keeper',
        password: 'pass',
        role: 'user',
      });
      addUser({
        id: 'remove-me',
        username: 'remover',
        displayName: 'Remover',
        password: 'pass',
        role: 'user',
      });

      deleteUser('remove-me');

      const users = getUsers();
      expect(users.find((u) => u.id === 'keep-me')).toBeDefined();
      expect(users.find((u) => u.id === 'remove-me')).toBeUndefined();
    });

    it('should handle deleting a non-existent user gracefully', () => {
      const usersBefore = getUsers();
      deleteUser('non-existent-id');
      const usersAfter = getUsers();
      expect(usersAfter.length).toBe(usersBefore.length);
    });
  });

  // ─── getPosts ─────────────────────────────────────────────────────────────

  describe('getPosts', () => {
    it('should return an empty array when no posts exist', () => {
      const posts = getPosts();
      expect(Array.isArray(posts)).toBe(true);
      expect(posts).toEqual([]);
    });

    it('should return empty array when localStorage has corrupted post data', () => {
      store['ws_posts'] = '{{invalid json}}';
      const posts = getPosts();
      expect(Array.isArray(posts)).toBe(true);
      expect(posts).toEqual([]);
    });

    it('should return empty array when localStorage has non-array JSON for posts', () => {
      store['ws_posts'] = JSON.stringify('just a string');
      const posts = getPosts();
      expect(Array.isArray(posts)).toBe(true);
      expect(posts).toEqual([]);
    });
  });

  // ─── addPost ──────────────────────────────────────────────────────────────

  describe('addPost', () => {
    it('should add a new post with all provided fields', () => {
      addPost({
        id: 'post-1',
        title: 'Test Post',
        content: 'This is the content of the test post.',
        excerpt: 'This is the excerpt.',
        authorId: 'admin-default-uuid',
        authorName: 'Site Owner',
        authorRole: 'admin',
        createdAt: '2024-01-15T12:00:00Z',
      });

      const posts = getPosts();
      expect(posts.length).toBe(1);
      expect(posts[0].id).toBe('post-1');
      expect(posts[0].title).toBe('Test Post');
      expect(posts[0].content).toBe('This is the content of the test post.');
      expect(posts[0].excerpt).toBe('This is the excerpt.');
      expect(posts[0].authorId).toBe('admin-default-uuid');
      expect(posts[0].authorName).toBe('Site Owner');
      expect(posts[0].authorRole).toBe('admin');
      expect(posts[0].createdAt).toBe('2024-01-15T12:00:00Z');
    });

    it('should generate a UUID if no id is provided', () => {
      addPost({
        title: 'No ID Post',
        content: 'Content here.',
        authorId: 'admin-default-uuid',
        authorName: 'Site Owner',
      });

      const posts = getPosts();
      const post = posts.find((p) => p.title === 'No ID Post');
      expect(post).toBeDefined();
      expect(post.id).toBeDefined();
      expect(typeof post.id).toBe('string');
      expect(post.id.length).toBeGreaterThan(0);
    });

    it('should auto-generate excerpt from content if not provided', () => {
      const longContent = 'A'.repeat(200);
      addPost({
        title: 'Auto Excerpt',
        content: longContent,
        authorId: 'admin-default-uuid',
        authorName: 'Site Owner',
      });

      const posts = getPosts();
      const post = posts.find((p) => p.title === 'Auto Excerpt');
      expect(post).toBeDefined();
      expect(post.excerpt).toBe(longContent.substring(0, 150));
    });

    it('should default authorRole to user if not provided', () => {
      addPost({
        title: 'Default Role Post',
        content: 'Content.',
        authorId: 'some-user-id',
        authorName: 'Some User',
      });

      const posts = getPosts();
      const post = posts.find((p) => p.title === 'Default Role Post');
      expect(post).toBeDefined();
      expect(post.authorRole).toBe('user');
    });

    it('should auto-generate createdAt if not provided', () => {
      addPost({
        title: 'Auto Date Post',
        content: 'Content.',
        authorId: 'some-user-id',
        authorName: 'Some User',
      });

      const posts = getPosts();
      const post = posts.find((p) => p.title === 'Auto Date Post');
      expect(post).toBeDefined();
      expect(post.createdAt).toBeDefined();
      // Should be a valid ISO date string
      expect(new Date(post.createdAt).toISOString()).toBe(post.createdAt);
    });

    it('should add multiple posts', () => {
      addPost({
        id: 'p1',
        title: 'Post 1',
        content: 'Content 1',
        authorId: 'u1',
        authorName: 'User 1',
      });
      addPost({
        id: 'p2',
        title: 'Post 2',
        content: 'Content 2',
        authorId: 'u2',
        authorName: 'User 2',
      });

      const posts = getPosts();
      expect(posts.length).toBe(2);
    });
  });

  // ─── updatePost ───────────────────────────────────────────────────────────

  describe('updatePost', () => {
    it('should update an existing post title and content', () => {
      addPost({
        id: 'update-me',
        title: 'Original Title',
        content: 'Original content.',
        authorId: 'admin-default-uuid',
        authorName: 'Site Owner',
        authorRole: 'admin',
        createdAt: '2024-01-15T12:00:00Z',
      });

      updatePost({
        id: 'update-me',
        title: 'Updated Title',
        content: 'Updated content.',
        authorId: 'admin-default-uuid',
        authorName: 'Site Owner',
        authorRole: 'admin',
      });

      const posts = getPosts();
      const post = posts.find((p) => p.id === 'update-me');
      expect(post).toBeDefined();
      expect(post.title).toBe('Updated Title');
      expect(post.content).toBe('Updated content.');
    });

    it('should preserve createdAt when updating', () => {
      addPost({
        id: 'preserve-date',
        title: 'Original',
        content: 'Content.',
        authorId: 'u1',
        authorName: 'User',
        createdAt: '2024-06-01T10:00:00Z',
      });

      updatePost({
        id: 'preserve-date',
        title: 'Updated',
        content: 'New content.',
        authorId: 'u1',
        authorName: 'User',
      });

      const posts = getPosts();
      const post = posts.find((p) => p.id === 'preserve-date');
      expect(post).toBeDefined();
      expect(post.createdAt).toBe('2024-06-01T10:00:00Z');
    });

    it('should not modify anything if post ID does not exist', () => {
      addPost({
        id: 'existing-post',
        title: 'Existing',
        content: 'Content.',
        authorId: 'u1',
        authorName: 'User',
      });

      updatePost({
        id: 'non-existent-post',
        title: 'Ghost',
        content: 'Ghost content.',
        authorId: 'u1',
        authorName: 'User',
      });

      const posts = getPosts();
      expect(posts.length).toBe(1);
      expect(posts[0].title).toBe('Existing');
    });

    it('should auto-generate excerpt from content on update if not provided', () => {
      addPost({
        id: 'excerpt-update',
        title: 'Excerpt Test',
        content: 'Short.',
        excerpt: 'Short.',
        authorId: 'u1',
        authorName: 'User',
      });

      const longContent = 'B'.repeat(200);
      updatePost({
        id: 'excerpt-update',
        title: 'Excerpt Test Updated',
        content: longContent,
        authorId: 'u1',
        authorName: 'User',
      });

      const posts = getPosts();
      const post = posts.find((p) => p.id === 'excerpt-update');
      expect(post).toBeDefined();
      expect(post.excerpt).toBe(longContent.substring(0, 150));
    });
  });

  // ─── deletePost ───────────────────────────────────────────────────────────

  describe('deletePost', () => {
    it('should remove a post by ID', () => {
      addPost({
        id: 'delete-post',
        title: 'Delete Me',
        content: 'Content.',
        authorId: 'u1',
        authorName: 'User',
      });

      let posts = getPosts();
      expect(posts.find((p) => p.id === 'delete-post')).toBeDefined();

      deletePost('delete-post');

      posts = getPosts();
      expect(posts.find((p) => p.id === 'delete-post')).toBeUndefined();
    });

    it('should not affect other posts when deleting', () => {
      addPost({
        id: 'keep-post',
        title: 'Keep',
        content: 'Content.',
        authorId: 'u1',
        authorName: 'User',
      });
      addPost({
        id: 'remove-post',
        title: 'Remove',
        content: 'Content.',
        authorId: 'u1',
        authorName: 'User',
      });

      deletePost('remove-post');

      const posts = getPosts();
      expect(posts.length).toBe(1);
      expect(posts[0].id).toBe('keep-post');
    });

    it('should handle deleting a non-existent post gracefully', () => {
      addPost({
        id: 'only-post',
        title: 'Only',
        content: 'Content.',
        authorId: 'u1',
        authorName: 'User',
      });

      deletePost('non-existent-post-id');

      const posts = getPosts();
      expect(posts.length).toBe(1);
    });
  });

  // ─── getSession ───────────────────────────────────────────────────────────

  describe('getSession', () => {
    it('should return null when no session exists', () => {
      const session = getSession();
      expect(session).toBeNull();
    });

    it('should return the session object when a valid session is stored', () => {
      const sessionData = {
        userId: 'admin-default-uuid',
        username: 'admin',
        role: 'admin',
        displayName: 'Site Owner',
      };
      store['ws_session'] = JSON.stringify(sessionData);

      const session = getSession();
      expect(session).toBeDefined();
      expect(session.userId).toBe('admin-default-uuid');
      expect(session.username).toBe('admin');
      expect(session.role).toBe('admin');
      expect(session.displayName).toBe('Site Owner');
    });

    it('should return null for corrupted session data', () => {
      store['ws_session'] = '{{not valid json}}';
      const session = getSession();
      expect(session).toBeNull();
    });

    it('should return null for session missing required fields', () => {
      store['ws_session'] = JSON.stringify({ userId: 'abc' });
      const session = getSession();
      expect(session).toBeNull();
    });

    it('should return null for session missing username', () => {
      store['ws_session'] = JSON.stringify({ userId: 'abc', role: 'user' });
      const session = getSession();
      expect(session).toBeNull();
    });

    it('should return null for session missing role', () => {
      store['ws_session'] = JSON.stringify({ userId: 'abc', username: 'test' });
      const session = getSession();
      expect(session).toBeNull();
    });
  });

  // ─── setSession ───────────────────────────────────────────────────────────

  describe('setSession', () => {
    it('should store a session in localStorage', () => {
      setSession({
        userId: 'user-123',
        username: 'testuser',
        role: 'user',
        displayName: 'Test User',
      });

      const session = getSession();
      expect(session).toBeDefined();
      expect(session.userId).toBe('user-123');
      expect(session.username).toBe('testuser');
      expect(session.role).toBe('user');
      expect(session.displayName).toBe('Test User');
    });

    it('should overwrite an existing session', () => {
      setSession({
        userId: 'user-1',
        username: 'first',
        role: 'user',
        displayName: 'First',
      });

      setSession({
        userId: 'user-2',
        username: 'second',
        role: 'admin',
        displayName: 'Second',
      });

      const session = getSession();
      expect(session.userId).toBe('user-2');
      expect(session.username).toBe('second');
      expect(session.role).toBe('admin');
      expect(session.displayName).toBe('Second');
    });
  });

  // ─── clearSession ────────────────────────────────────────────────────────

  describe('clearSession', () => {
    it('should remove the session from localStorage', () => {
      setSession({
        userId: 'user-123',
        username: 'testuser',
        role: 'user',
        displayName: 'Test User',
      });

      expect(getSession()).not.toBeNull();

      clearSession();

      expect(getSession()).toBeNull();
    });

    it('should not throw when no session exists', () => {
      expect(() => clearSession()).not.toThrow();
    });
  });

  // ─── Graceful Fallback on localStorage Errors ─────────────────────────────

  describe('graceful fallback on localStorage errors', () => {
    it('getUsers should return empty array when getItem throws', () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('localStorage unavailable');
      });
      const users = getUsers();
      expect(Array.isArray(users)).toBe(true);
    });

    it('getPosts should return empty array when getItem throws', () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('localStorage unavailable');
      });
      const posts = getPosts();
      expect(Array.isArray(posts)).toBe(true);
    });

    it('getSession should return null when getItem throws', () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('localStorage unavailable');
      });
      const session = getSession();
      expect(session).toBeNull();
    });

    it('addUser should not throw when setItem throws', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('localStorage full');
      });
      expect(() =>
        addUser({
          username: 'failuser',
          displayName: 'Fail',
          password: 'pass',
        })
      ).not.toThrow();
    });

    it('addPost should not throw when setItem throws', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('localStorage full');
      });
      expect(() =>
        addPost({
          title: 'Fail Post',
          content: 'Content.',
          authorId: 'u1',
          authorName: 'User',
        })
      ).not.toThrow();
    });

    it('clearSession should not throw when removeItem throws', () => {
      localStorageMock.removeItem.mockImplementationOnce(() => {
        throw new Error('localStorage unavailable');
      });
      expect(() => clearSession()).not.toThrow();
    });
  });
});