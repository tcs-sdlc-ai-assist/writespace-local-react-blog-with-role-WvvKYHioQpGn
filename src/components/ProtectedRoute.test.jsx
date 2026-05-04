import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

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

let ProtectedRoute;

beforeEach(async () => {
  store = {};
  vi.clearAllMocks();
  vi.resetModules();

  const mod = await import('./ProtectedRoute.jsx');
  ProtectedRoute = mod.default;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('ProtectedRoute', () => {
  describe('unauthenticated user', () => {
    it('should redirect to /login when no session exists', () => {
      render(
        <MemoryRouter initialEntries={['/blogs']}>
          <Routes>
            <Route
              path="/blogs"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('should redirect to /login when session data is corrupted', () => {
      store['ws_session'] = '{{invalid json}}';

      render(
        <MemoryRouter initialEntries={['/blogs']}>
          <Routes>
            <Route
              path="/blogs"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('should redirect to /login when session is missing required fields', () => {
      store['ws_session'] = JSON.stringify({ userId: 'abc' });

      render(
        <MemoryRouter initialEntries={['/blogs']}>
          <Routes>
            <Route
              path="/blogs"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  describe('authenticated regular user', () => {
    beforeEach(() => {
      store['ws_session'] = JSON.stringify({
        userId: 'user-123',
        username: 'testuser',
        role: 'user',
        displayName: 'Test User',
      });
    });

    it('should render children for regular protected routes', () => {
      render(
        <MemoryRouter initialEntries={['/blogs']}>
          <Routes>
            <Route
              path="/blogs"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });

    it('should redirect non-admin user to /blogs when accessing admin route', () => {
      render(
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <div>Admin Dashboard</div>
                </ProtectedRoute>
              }
            />
            <Route path="/blogs" element={<div>Blogs Page</div>} />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
      expect(screen.getByText('Blogs Page')).toBeInTheDocument();
    });

    it('should render children when no role prop is specified', () => {
      render(
        <MemoryRouter initialEntries={['/write']}>
          <Routes>
            <Route
              path="/write"
              element={
                <ProtectedRoute>
                  <div>Write Page</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Write Page')).toBeInTheDocument();
    });
  });

  describe('authenticated admin user', () => {
    beforeEach(() => {
      store['ws_session'] = JSON.stringify({
        userId: 'admin-default-uuid',
        username: 'admin',
        role: 'admin',
        displayName: 'Site Owner',
      });
    });

    it('should render children for admin-only routes', () => {
      render(
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <div>Admin Dashboard</div>
                </ProtectedRoute>
              }
            />
            <Route path="/blogs" element={<div>Blogs Page</div>} />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      expect(screen.queryByText('Blogs Page')).not.toBeInTheDocument();
      expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });

    it('should render children for admin user management route', () => {
      render(
        <MemoryRouter initialEntries={['/admin/users']}>
          <Routes>
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute role="admin">
                  <div>User Management</div>
                </ProtectedRoute>
              }
            />
            <Route path="/blogs" element={<div>Blogs Page</div>} />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('User Management')).toBeInTheDocument();
    });

    it('should render children for regular protected routes when logged in as admin', () => {
      render(
        <MemoryRouter initialEntries={['/blogs']}>
          <Routes>
            <Route
              path="/blogs"
              element={
                <ProtectedRoute>
                  <div>Blogs Page</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Blogs Page')).toBeInTheDocument();
    });
  });
});