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

let RegisterPage;

beforeEach(async () => {
  store = {};
  vi.clearAllMocks();
  vi.resetModules();

  const mod = await import('./RegisterPage.jsx');
  RegisterPage = mod.default;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('RegisterPage', () => {
  describe('rendering', () => {
    it('should render the registration form with all fields', () => {
      render(
        <MemoryRouter initialEntries={['/register']}>
          <Routes>
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('should render the Create Account heading', () => {
      render(
        <MemoryRouter initialEntries={['/register']}>
          <Routes>
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Create Account')).toBeInTheDocument();
    });

    it('should render a link to the login page', () => {
      render(
        <MemoryRouter initialEntries={['/register']}>
          <Routes>
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </MemoryRouter>
      );

      const loginLink = screen.getByRole('link', { name: /sign in/i });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('should render the WriteSpace brand link', () => {
      render(
        <MemoryRouter initialEntries={['/register']}>
          <Routes>
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </MemoryRouter>
      );

      const brandLink = screen.getByText(/WriteSpace/i);
      expect(brandLink).toBeInTheDocument();
    });
  });

  describe('validation errors', () => {
    it('should show error when display name is empty', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter initialEntries={['/register']}>
          <Routes>
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </MemoryRouter>
      );

      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(screen.getByText('Display name is required.')).toBeInTheDocument();
    });

    it('should show error when username is empty', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter initialEntries={['/register']}>
          <Routes>
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </MemoryRouter>
      );

      await user.type(screen.getByLabelText(/display name/i), 'Test User');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(screen.getByText('Username is required.')).toBeInTheDocument();
    });

    it('should show error when password is empty', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter initialEntries={['/register']}>
          <Routes>
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </MemoryRouter>
      );

      await user.type(screen.getByLabelText(/display name/i), 'Test User');
      await user.type(screen.getByLabelText(/username/i), 'testuser');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(screen.getByText('Password is required.')).toBeInTheDocument();
    });

    it('should show error when password is less than 6 characters', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter initialEntries={['/register']}>
          <Routes>
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </MemoryRouter>
      );

      await user.type(screen.getByLabelText(/display name/i), 'Test User');
      await user.type(screen.getByLabelText(/username/i), 'testuser');
      await user.type(screen.getByLabelText(/^password$/i), 'short');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(screen.getByText('Password must be at least 6 characters.')).toBeInTheDocument();
    });

    it('should show error when confirm password is empty', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter initialEntries={['/register']}>
          <Routes>
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </MemoryRouter>
      );

      await user.type(screen.getByLabelText(/display name/i), 'Test User');
      await user.type(screen.getByLabelText(/username/i), 'testuser');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(screen.getByText('Please confirm your password.')).toBeInTheDocument();
    });

    it('should show error when passwords do not match', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter initialEntries={['/register']}>
          <Routes>
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </MemoryRouter>
      );

      await user.type(screen.getByLabelText(/display name/i), 'Test User');
      await user.type(screen.getByLabelText(/username/i), 'testuser');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'differentpass');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    });
  });

  describe('unique username validation', () => {
    it('should show error when username is already taken', async () => {
      const user = userEvent.setup();

      vi.resetModules();
      const storageMod = await import('../utils/storage.js');
      storageMod.addUser({
        id: 'existing-user-id',
        username: 'existinguser',
        displayName: 'Existing User',
        password: 'password123',
        role: 'user',
      });

      const registerMod = await import('./RegisterPage.jsx');
      const RegisterPageComponent = registerMod.default;

      render(
        <MemoryRouter initialEntries={['/register']}>
          <Routes>
            <Route path="/register" element={<RegisterPageComponent />} />
          </Routes>
        </MemoryRouter>
      );

      await user.type(screen.getByLabelText(/display name/i), 'Another User');
      await user.type(screen.getByLabelText(/username/i), 'existinguser');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(screen.getByText('Username is already taken. Please choose another.')).toBeInTheDocument();
    });

    it('should show error when trying to register with admin username', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter initialEntries={['/register']}>
          <Routes>
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </MemoryRouter>
      );

      await user.type(screen.getByLabelText(/display name/i), 'Fake Admin');
      await user.type(screen.getByLabelText(/username/i), 'admin');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(screen.getByText('Username is already taken. Please choose another.')).toBeInTheDocument();
    });
  });

  describe('successful registration', () => {
    it('should redirect to /blogs on successful registration', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter initialEntries={['/register']}>
          <Routes>
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/blogs" element={<div>Blogs Page</div>} />
            <Route path="/admin" element={<div>Admin Dashboard</div>} />
          </Routes>
        </MemoryRouter>
      );

      await user.type(screen.getByLabelText(/display name/i), 'New User');
      await user.type(screen.getByLabelText(/username/i), 'newuser');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText('Blogs Page')).toBeInTheDocument();
      });
    });

    it('should create the user in localStorage after successful registration', async () => {
      const user = userEvent.setup();

      vi.resetModules();
      const storageMod = await import('../utils/storage.js');
      const registerMod = await import('./RegisterPage.jsx');
      const RegisterPageComponent = registerMod.default;

      render(
        <MemoryRouter initialEntries={['/register']}>
          <Routes>
            <Route path="/register" element={<RegisterPageComponent />} />
            <Route path="/blogs" element={<div>Blogs Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      await user.type(screen.getByLabelText(/display name/i), 'Charlie');
      await user.type(screen.getByLabelText(/username/i), 'charlie');
      await user.type(screen.getByLabelText(/^password$/i), 'charliepass');
      await user.type(screen.getByLabelText(/confirm password/i), 'charliepass');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText('Blogs Page')).toBeInTheDocument();
      });

      const users = storageMod.getUsers();
      const charlie = users.find((u) => u.username === 'charlie');
      expect(charlie).toBeDefined();
      expect(charlie.displayName).toBe('Charlie');
      expect(charlie.role).toBe('user');
    });
  });

  describe('authenticated user redirect', () => {
    it('should redirect authenticated admin user away from register page', async () => {
      store['ws_session'] = JSON.stringify({
        userId: 'admin-default-uuid',
        username: 'admin',
        role: 'admin',
        displayName: 'Site Owner',
      });

      vi.resetModules();
      const registerMod = await import('./RegisterPage.jsx');
      const RegisterPageComponent = registerMod.default;

      render(
        <MemoryRouter initialEntries={['/register']}>
          <Routes>
            <Route path="/register" element={<RegisterPageComponent />} />
            <Route path="/admin" element={<div>Admin Dashboard</div>} />
            <Route path="/blogs" element={<div>Blogs Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });

      expect(screen.queryByText('Create Account')).not.toBeInTheDocument();
    });

    it('should redirect authenticated regular user away from register page', async () => {
      store['ws_session'] = JSON.stringify({
        userId: 'user-123',
        username: 'testuser',
        role: 'user',
        displayName: 'Test User',
      });

      vi.resetModules();
      const registerMod = await import('./RegisterPage.jsx');
      const RegisterPageComponent = registerMod.default;

      render(
        <MemoryRouter initialEntries={['/register']}>
          <Routes>
            <Route path="/register" element={<RegisterPageComponent />} />
            <Route path="/admin" element={<div>Admin Dashboard</div>} />
            <Route path="/blogs" element={<div>Blogs Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Blogs Page')).toBeInTheDocument();
      });

      expect(screen.queryByText('Create Account')).not.toBeInTheDocument();
    });
  });

  describe('form interaction', () => {
    it('should allow typing in all form fields', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter initialEntries={['/register']}>
          <Routes>
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </MemoryRouter>
      );

      const displayNameInput = screen.getByLabelText(/display name/i);
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      await user.type(displayNameInput, 'My Name');
      await user.type(usernameInput, 'myuser');
      await user.type(passwordInput, 'mypass123');
      await user.type(confirmPasswordInput, 'mypass123');

      expect(displayNameInput).toHaveValue('My Name');
      expect(usernameInput).toHaveValue('myuser');
      expect(passwordInput).toHaveValue('mypass123');
      expect(confirmPasswordInput).toHaveValue('mypass123');
    });

    it('should clear error when form is resubmitted', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter initialEntries={['/register']}>
          <Routes>
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </MemoryRouter>
      );

      // Submit empty form to trigger error
      await user.click(screen.getByRole('button', { name: /create account/i }));
      expect(screen.getByText('Display name is required.')).toBeInTheDocument();

      // Type display name and submit again
      await user.type(screen.getByLabelText(/display name/i), 'Test User');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      // Previous error should be replaced
      expect(screen.queryByText('Display name is required.')).not.toBeInTheDocument();
      expect(screen.getByText('Username is required.')).toBeInTheDocument();
    });

    it('should show sequential validation errors as fields are filled', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter initialEntries={['/register']}>
          <Routes>
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </MemoryRouter>
      );

      // Submit with no fields
      await user.click(screen.getByRole('button', { name: /create account/i }));
      expect(screen.getByText('Display name is required.')).toBeInTheDocument();

      // Fill display name, submit
      await user.type(screen.getByLabelText(/display name/i), 'User');
      await user.click(screen.getByRole('button', { name: /create account/i }));
      expect(screen.getByText('Username is required.')).toBeInTheDocument();

      // Fill username, submit
      await user.type(screen.getByLabelText(/username/i), 'user');
      await user.click(screen.getByRole('button', { name: /create account/i }));
      expect(screen.getByText('Password is required.')).toBeInTheDocument();

      // Fill short password, submit
      await user.type(screen.getByLabelText(/^password$/i), 'abc');
      await user.click(screen.getByRole('button', { name: /create account/i }));
      expect(screen.getByText('Password must be at least 6 characters.')).toBeInTheDocument();
    });
  });
});