import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

let LoginPage;

beforeEach(async () => {
  store = {};
  vi.clearAllMocks();
  vi.resetModules();

  const mod = await import('./LoginPage.jsx');
  LoginPage = mod.default;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('LoginPage', () => {
  describe('rendering', () => {
    it('should render the login form with username and password fields', () => {
      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should render the Welcome Back heading', () => {
      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    });

    it('should render a link to the register page', () => {
      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      );

      const registerLink = screen.getByRole('link', { name: /create one/i });
      expect(registerLink).toBeInTheDocument();
      expect(registerLink).toHaveAttribute('href', '/register');
    });

    it('should render the WriteSpace brand link', () => {
      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      );

      const brandLink = screen.getByText(/WriteSpace/i);
      expect(brandLink).toBeInTheDocument();
    });
  });

  describe('validation errors', () => {
    it('should show error when username is empty', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      );

      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(screen.getByText('Username is required.')).toBeInTheDocument();
    });

    it('should show error when password is empty', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      );

      await user.type(screen.getByLabelText(/username/i), 'someuser');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(screen.getByText('Password is required.')).toBeInTheDocument();
    });
  });

  describe('invalid credentials', () => {
    it('should show error on invalid credentials', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      );

      await user.type(screen.getByLabelText(/username/i), 'wronguser');
      await user.type(screen.getByLabelText(/password/i), 'wrongpass');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(screen.getByText('Invalid username or password.')).toBeInTheDocument();
    });

    it('should show error for admin with wrong password', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      );

      await user.type(screen.getByLabelText(/username/i), 'admin');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(screen.getByText('Invalid username or password.')).toBeInTheDocument();
    });
  });

  describe('successful login', () => {
    it('should redirect admin to /admin on successful login', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<div>Admin Dashboard</div>} />
            <Route path="/blogs" element={<div>Blogs Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      await user.type(screen.getByLabelText(/username/i), 'admin');
      await user.type(screen.getByLabelText(/password/i), 'admin123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });
    });

    it('should redirect regular user to /blogs on successful login', async () => {
      const user = userEvent.setup();

      // Add a regular user to storage
      vi.resetModules();
      const storageMod = await import('../utils/storage.js');
      storageMod.addUser({
        id: 'user-login-test',
        username: 'testuser',
        displayName: 'Test User',
        password: 'testpass123',
        role: 'user',
      });

      // Re-import LoginPage after storage is set up
      const loginMod = await import('./LoginPage.jsx');
      const LoginPageComponent = loginMod.default;

      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPageComponent />} />
            <Route path="/admin" element={<div>Admin Dashboard</div>} />
            <Route path="/blogs" element={<div>Blogs Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      await user.type(screen.getByLabelText(/username/i), 'testuser');
      await user.type(screen.getByLabelText(/password/i), 'testpass123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Blogs Page')).toBeInTheDocument();
      });
    });
  });

  describe('authenticated user redirect', () => {
    it('should redirect authenticated admin user away from login page', async () => {
      store['ws_session'] = JSON.stringify({
        userId: 'admin-default-uuid',
        username: 'admin',
        role: 'admin',
        displayName: 'Site Owner',
      });

      vi.resetModules();
      const loginMod = await import('./LoginPage.jsx');
      const LoginPageComponent = loginMod.default;

      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPageComponent />} />
            <Route path="/admin" element={<div>Admin Dashboard</div>} />
            <Route path="/blogs" element={<div>Blogs Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });

      expect(screen.queryByText('Welcome Back')).not.toBeInTheDocument();
    });

    it('should redirect authenticated regular user away from login page', async () => {
      store['ws_session'] = JSON.stringify({
        userId: 'user-123',
        username: 'testuser',
        role: 'user',
        displayName: 'Test User',
      });

      vi.resetModules();
      const loginMod = await import('./LoginPage.jsx');
      const LoginPageComponent = loginMod.default;

      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPageComponent />} />
            <Route path="/admin" element={<div>Admin Dashboard</div>} />
            <Route path="/blogs" element={<div>Blogs Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Blogs Page')).toBeInTheDocument();
      });

      expect(screen.queryByText('Welcome Back')).not.toBeInTheDocument();
    });
  });

  describe('form interaction', () => {
    it('should allow typing in username and password fields', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      );

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(usernameInput, 'myuser');
      await user.type(passwordInput, 'mypass');

      expect(usernameInput).toHaveValue('myuser');
      expect(passwordInput).toHaveValue('mypass');
    });

    it('should clear error when form is resubmitted', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      );

      // Submit empty form to trigger error
      await user.click(screen.getByRole('button', { name: /sign in/i }));
      expect(screen.getByText('Username is required.')).toBeInTheDocument();

      // Type username and submit again
      await user.type(screen.getByLabelText(/username/i), 'someuser');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // Previous error should be replaced
      expect(screen.queryByText('Username is required.')).not.toBeInTheDocument();
      expect(screen.getByText('Password is required.')).toBeInTheDocument();
    });
  });
});