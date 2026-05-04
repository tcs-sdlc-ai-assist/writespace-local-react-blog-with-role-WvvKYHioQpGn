import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

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

// Import auth functions after localStorage mock is in place
let login, register, logout, isAdmin, getCurrentUser;

beforeEach(async () => {
  store = {};
  vi.clearAllMocks();

  // Re-import the modules fresh each time so ensureAdmin() runs against clean storage
  vi.resetModules();
  const authMod = await import('./auth.js');
  login = authMod.login;
  register = authMod.register;
  logout = authMod.logout;
  isAdmin = authMod.isAdmin;
  getCurrentUser = authMod.getCurrentUser;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('auth.js', () => {
  // ─── login ────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('should authenticate the hardcoded admin with correct credentials', () => {
      const session = login('admin', 'admin123');
      expect(session).not.toBeNull();
      expect(session.userId).toBe('admin-default-uuid');
      expect(session.username).toBe('admin');
      expect(session.role).toBe('admin');
      expect(session.displayName).toBe('Site Owner');
    });

    it('should set session in localStorage after successful admin login', () => {
      login('admin', 'admin123');
      const raw = store['ws_session'];
      expect(raw).toBeDefined();
      const session = JSON.parse(raw);
      expect(session.userId).toBe('admin-default-uuid');
      expect(session.role).toBe('admin');
    });

    it('should return null for hardcoded admin with wrong password', () => {
      const session = login('admin', 'wrongpassword');
      expect(session).toBeNull();
    });

    it('should return null for empty username', () => {
      const session = login('', 'admin123');
      expect(session).toBeNull();
    });

    it('should return null for empty password', () => {
      const session = login('admin', '');
      expect(session).toBeNull();
    });

    it('should return null for null username', () => {
      const session = login(null, 'admin123');
      expect(session).toBeNull();
    });

    it('should return null for null password', () => {
      const session = login('admin', null);
      expect(session).toBeNull();
    });

    it('should return null for undefined username', () => {
      const session = login(undefined, 'admin123');
      expect(session).toBeNull();
    });

    it('should return null for undefined password', () => {
      const session = login('admin', undefined);
      expect(session).toBeNull();
    });

    it('should return null for non-existent user', () => {
      const session = login('nonexistent', 'password123');
      expect(session).toBeNull();
    });

    it('should authenticate a registered localStorage user with correct credentials', async () => {
      // First register a user
      vi.resetModules();
      const storageMod = await import('./storage.js');
      const authMod = await import('./auth.js');

      storageMod.addUser({
        id: 'user-test-1',
        username: 'testuser',
        displayName: 'Test User',
        password: 'testpass123',
        role: 'user',
      });

      const session = authMod.login('testuser', 'testpass123');
      expect(session).not.toBeNull();
      expect(session.userId).toBe('user-test-1');
      expect(session.username).toBe('testuser');
      expect(session.role).toBe('user');
      expect(session.displayName).toBe('Test User');
    });

    it('should return null for a registered user with wrong password', async () => {
      vi.resetModules();
      const storageMod = await import('./storage.js');
      const authMod = await import('./auth.js');

      storageMod.addUser({
        id: 'user-test-2',
        username: 'alice',
        displayName: 'Alice',
        password: 'alicepass',
        role: 'user',
      });

      const session = authMod.login('alice', 'wrongpass');
      expect(session).toBeNull();
    });

    it('should set session in localStorage after successful user login', async () => {
      vi.resetModules();
      const storageMod = await import('./storage.js');
      const authMod = await import('./auth.js');

      storageMod.addUser({
        id: 'user-test-3',
        username: 'bob',
        displayName: 'Bob',
        password: 'bobpass123',
        role: 'user',
      });

      authMod.login('bob', 'bobpass123');
      const raw = store['ws_session'];
      expect(raw).toBeDefined();
      const session = JSON.parse(raw);
      expect(session.userId).toBe('user-test-3');
      expect(session.username).toBe('bob');
      expect(session.role).toBe('user');
      expect(session.displayName).toBe('Bob');
    });
  });

  // ─── register ─────────────────────────────────────────────────────────────

  describe('register', () => {
    it('should register a new user and return a session', () => {
      const session = register('New User', 'newuser', 'password123');
      expect(session).not.toBeNull();
      expect(session.username).toBe('newuser');
      expect(session.role).toBe('user');
      expect(session.displayName).toBe('New User');
      expect(session.userId).toBeDefined();
      expect(typeof session.userId).toBe('string');
    });

    it('should set session in localStorage after successful registration', () => {
      register('Jane Doe', 'janedoe', 'janepass');
      const raw = store['ws_session'];
      expect(raw).toBeDefined();
      const session = JSON.parse(raw);
      expect(session.username).toBe('janedoe');
      expect(session.displayName).toBe('Jane Doe');
      expect(session.role).toBe('user');
    });

    it('should add the new user to localStorage users', async () => {
      vi.resetModules();
      const storageMod = await import('./storage.js');
      const authMod = await import('./auth.js');

      authMod.register('Charlie', 'charlie', 'charliepass');

      const users = storageMod.getUsers();
      const charlie = users.find((u) => u.username === 'charlie');
      expect(charlie).toBeDefined();
      expect(charlie.displayName).toBe('Charlie');
      expect(charlie.role).toBe('user');
    });

    it('should return null when registering with a duplicate username', async () => {
      vi.resetModules();
      const storageMod = await import('./storage.js');
      const authMod = await import('./auth.js');

      storageMod.addUser({
        id: 'existing-user',
        username: 'duplicate',
        displayName: 'Existing',
        password: 'pass123',
        role: 'user',
      });

      const session = authMod.register('Another', 'duplicate', 'anotherpass');
      expect(session).toBeNull();
    });

    it('should return null when registering with the hardcoded admin username', () => {
      const session = register('Fake Admin', 'admin', 'fakepass');
      expect(session).toBeNull();
    });

    it('should return null when displayName is empty', () => {
      const session = register('', 'someuser', 'password123');
      expect(session).toBeNull();
    });

    it('should return null when username is empty', () => {
      const session = register('Some User', '', 'password123');
      expect(session).toBeNull();
    });

    it('should return null when password is empty', () => {
      const session = register('Some User', 'someuser', '');
      expect(session).toBeNull();
    });

    it('should return null when displayName is null', () => {
      const session = register(null, 'someuser', 'password123');
      expect(session).toBeNull();
    });

    it('should return null when username is null', () => {
      const session = register('Some User', null, 'password123');
      expect(session).toBeNull();
    });

    it('should return null when password is null', () => {
      const session = register('Some User', 'someuser', null);
      expect(session).toBeNull();
    });

    it('should return null when displayName is undefined', () => {
      const session = register(undefined, 'someuser', 'password123');
      expect(session).toBeNull();
    });

    it('should return null when username is undefined', () => {
      const session = register('Some User', undefined, 'password123');
      expect(session).toBeNull();
    });

    it('should return null when password is undefined', () => {
      const session = register('Some User', 'someuser', undefined);
      expect(session).toBeNull();
    });

    it('should always assign the user role to registered users', () => {
      const session = register('Regular User', 'regularuser', 'pass123');
      expect(session).not.toBeNull();
      expect(session.role).toBe('user');
    });

    it('should allow registering multiple unique users', () => {
      const session1 = register('User One', 'userone', 'pass1');
      const session2 = register('User Two', 'usertwo', 'pass2');
      expect(session1).not.toBeNull();
      expect(session2).not.toBeNull();
      expect(session1.username).toBe('userone');
      expect(session2.username).toBe('usertwo');
    });
  });

  // ─── logout ───────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('should clear the session from localStorage', () => {
      login('admin', 'admin123');
      expect(getCurrentUser()).not.toBeNull();

      logout();
      expect(getCurrentUser()).toBeNull();
    });

    it('should not throw when no session exists', () => {
      expect(() => logout()).not.toThrow();
    });

    it('should remove the ws_session key from localStorage', () => {
      login('admin', 'admin123');
      expect(store['ws_session']).toBeDefined();

      logout();
      expect(store['ws_session']).toBeUndefined();
    });
  });

  // ─── isAdmin ──────────────────────────────────────────────────────────────

  describe('isAdmin', () => {
    it('should return true when logged in as admin', () => {
      login('admin', 'admin123');
      expect(isAdmin()).toBe(true);
    });

    it('should return false when logged in as a regular user', () => {
      register('Regular', 'regular', 'regularpass');
      expect(isAdmin()).toBe(false);
    });

    it('should return false when no session exists', () => {
      expect(isAdmin()).toBe(false);
    });

    it('should return false after admin logs out', () => {
      login('admin', 'admin123');
      expect(isAdmin()).toBe(true);

      logout();
      expect(isAdmin()).toBe(false);
    });

    it('should return false when session data is corrupted', () => {
      store['ws_session'] = '{{invalid json}}';
      expect(isAdmin()).toBe(false);
    });

    it('should return false when session is missing role field', () => {
      store['ws_session'] = JSON.stringify({ userId: 'abc', username: 'test' });
      expect(isAdmin()).toBe(false);
    });
  });

  // ─── getCurrentUser ───────────────────────────────────────────────────────

  describe('getCurrentUser', () => {
    it('should return null when no session exists', () => {
      const user = getCurrentUser();
      expect(user).toBeNull();
    });

    it('should return session data after admin login', () => {
      login('admin', 'admin123');
      const user = getCurrentUser();
      expect(user).not.toBeNull();
      expect(user.userId).toBe('admin-default-uuid');
      expect(user.username).toBe('admin');
      expect(user.role).toBe('admin');
      expect(user.displayName).toBe('Site Owner');
    });

    it('should return session data after user registration', () => {
      register('Test User', 'testuser', 'testpass');
      const user = getCurrentUser();
      expect(user).not.toBeNull();
      expect(user.username).toBe('testuser');
      expect(user.role).toBe('user');
      expect(user.displayName).toBe('Test User');
    });

    it('should return null after logout', () => {
      login('admin', 'admin123');
      expect(getCurrentUser()).not.toBeNull();

      logout();
      expect(getCurrentUser()).toBeNull();
    });

    it('should return null when session data is corrupted', () => {
      store['ws_session'] = '{{invalid json}}';
      const user = getCurrentUser();
      expect(user).toBeNull();
    });

    it('should return null when session is missing required fields', () => {
      store['ws_session'] = JSON.stringify({ userId: 'abc' });
      const user = getCurrentUser();
      expect(user).toBeNull();
    });

    it('should return null when session is missing username', () => {
      store['ws_session'] = JSON.stringify({ userId: 'abc', role: 'user' });
      const user = getCurrentUser();
      expect(user).toBeNull();
    });

    it('should return null when session is missing role', () => {
      store['ws_session'] = JSON.stringify({ userId: 'abc', username: 'test' });
      const user = getCurrentUser();
      expect(user).toBeNull();
    });

    it('should return the most recent session after multiple logins', () => {
      login('admin', 'admin123');
      expect(getCurrentUser().username).toBe('admin');

      register('Another', 'another', 'anotherpass');
      expect(getCurrentUser().username).toBe('another');
    });
  });

  // ─── Integration: login after register ────────────────────────────────────

  describe('login after register', () => {
    it('should allow login with credentials used during registration', () => {
      register('Fresh User', 'freshuser', 'freshpass');
      logout();

      const session = login('freshuser', 'freshpass');
      expect(session).not.toBeNull();
      expect(session.username).toBe('freshuser');
      expect(session.displayName).toBe('Fresh User');
      expect(session.role).toBe('user');
    });

    it('should not allow login with wrong password after registration', () => {
      register('Secure User', 'secureuser', 'correctpass');
      logout();

      const session = login('secureuser', 'wrongpass');
      expect(session).toBeNull();
    });
  });

  // ─── Graceful fallback on localStorage errors ─────────────────────────────

  describe('graceful fallback on localStorage errors', () => {
    it('login should return null when localStorage getItem throws', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });
      const session = login('admin', 'admin123');
      expect(session).toBeNull();
    });

    it('register should return null when localStorage setItem throws', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage full');
      });
      const session = register('Fail User', 'failuser', 'failpass');
      expect(session).toBeNull();
    });

    it('getCurrentUser should return null when localStorage getItem throws', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });
      const user = getCurrentUser();
      expect(user).toBeNull();
    });

    it('isAdmin should return false when localStorage getItem throws', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });
      expect(isAdmin()).toBe(false);
    });

    it('logout should not throw when localStorage removeItem throws', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });
      expect(() => logout()).not.toThrow();
    });
  });
});