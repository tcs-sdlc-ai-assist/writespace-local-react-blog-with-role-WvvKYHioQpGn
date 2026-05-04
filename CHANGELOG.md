# Changelog

All notable changes to the WriteSpace Blog project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-09-15

### Added

- **Public Landing Page**
  - Hero section with gradient background and call-to-action buttons
  - Features section highlighting role-based access, easy blogging, and admin dashboard
  - Latest posts preview section for unauthenticated visitors
  - Responsive footer with brand info, quick links, and about section

- **Authentication System**
  - Login page with username and password validation
  - Registration page with display name, username, password, and confirm password fields
  - Password minimum length enforcement (6 characters)
  - Username uniqueness validation during registration
  - Hardcoded admin account (`admin` / `admin123`) for initial access
  - Automatic redirect for already-authenticated users on login and register pages
  - Role-based redirect after login (admin → `/admin`, user → `/blogs`)

- **Role-Based Route Guards**
  - `ProtectedRoute` component for authenticated-only routes
  - Admin-only route protection for `/admin` and `/admin/users`
  - Unauthenticated users redirected to `/login`
  - Non-admin users redirected to `/blogs` when accessing admin routes
  - Catch-all route redirecting unknown paths to `/`

- **Avatar System**
  - Role-distinct circular badge avatars
  - Crown emoji (👑) with violet background for admin users
  - Book emoji (📖) with indigo background for regular users
  - Reusable `Avatar` component and `getAvatar` utility function

- **Blog CRUD with Ownership**
  - Create new blog posts at `/write` with title and content fields
  - Edit existing posts at `/edit/:id` with pre-filled form data
  - Read full blog posts at `/blogs/:id` with author info and formatted date
  - Delete posts with inline confirmation dialog
  - Ownership enforcement: users can only edit/delete their own posts
  - Admin override: admins can edit and delete any post
  - Auto-generated excerpt from content (first 150 characters)
  - Character counter on content textarea
  - UUID-based post identification

- **Blog Listing**
  - Authenticated blog listing page at `/blogs` with responsive grid layout
  - Posts sorted by creation date (newest first)
  - Blog cards displaying title, excerpt, author avatar, author name, and formatted date
  - Edit icon on cards for authorized users (owner or admin)
  - Empty state with call-to-action to write first post

- **Admin Dashboard**
  - Gradient banner header with personalized welcome message
  - Statistics cards showing total posts, total users, admin count, and user count
  - Quick action buttons for writing new posts and managing users
  - Recent posts section displaying latest 5 posts with edit and delete controls
  - Empty state guidance when no posts exist

- **User Management**
  - Admin-only user management page at `/admin/users`
  - Create new user form with display name, username, password, and role dropdown
  - Username uniqueness validation during user creation
  - User listing in responsive table (desktop) and card (mobile) layouts
  - Delete users with inline confirmation dialog
  - Protection against deleting the hardcoded admin account
  - Protection against deleting the currently logged-in user
  - Role badge pills distinguishing admin and user roles
  - Success and error message feedback

- **Navigation**
  - Authenticated `Navbar` with brand logo, navigation links, avatar chip, and logout button
  - Public `PublicNavbar` with conditional rendering for guests and authenticated users
  - Responsive mobile hamburger menu for both navigation bars
  - Sticky top positioning with border separator

- **localStorage Persistence**
  - All data stored in browser localStorage with `ws_` key prefix
  - `ws_users` for user accounts, `ws_posts` for blog posts, `ws_session` for active session
  - Safe JSON parsing with fallback values for corrupted data
  - Graceful error handling when localStorage is unavailable or full
  - Automatic admin user initialization on module load

- **Responsive Tailwind CSS UI**
  - Custom color palette with primary (violet), secondary (indigo), accent (fuchsia), and surface (slate) scales
  - Custom gradient backgrounds for primary, accent, and surface themes
  - Custom box shadows for cards and primary action buttons
  - Responsive breakpoints using `sm:`, `md:`, and `lg:` prefixes
  - Inter font family as default sans-serif
  - Consistent rounded corners, spacing, and transition animations

- **Testing**
  - Unit tests for `storage.js` utility functions
  - Unit tests for `auth.js` authentication functions
  - Component tests for `ProtectedRoute` route guard
  - Integration tests for `LoginPage` form validation and authentication flow
  - Integration tests for `RegisterPage` form validation and registration flow
  - Vitest test runner with jsdom environment and React Testing Library

- **Deployment Configuration**
  - Vercel deployment configuration with SPA rewrite rules
  - Vite build configuration with source maps
  - PostCSS configuration with Tailwind CSS and Autoprefixer plugins
  - Environment variable support via `.env.example`