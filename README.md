# WriteSpace

A modern, role-based blogging platform built with React 18+, Vite, and Tailwind CSS. All data is stored locally in your browser using localStorage — no backend required.

## Features

### Public
- **Landing Page** — Hero section with gradient background, feature highlights, and latest posts preview
- **Authentication** — Login and registration with form validation and password enforcement

### Authenticated Users
- **Blog Listing** — Responsive grid of all published posts, sorted newest first
- **Read Posts** — Full post view with author info and formatted dates
- **Write Posts** — Create new blog posts with title, content, and auto-generated excerpts
- **Edit & Delete** — Modify or remove your own posts with inline confirmation dialogs

### Admin
- **Admin Dashboard** — Statistics overview (total posts, users, admins), recent posts management, quick actions
- **User Management** — Create new users with role assignment, delete users (with protection for the default admin and self-deletion)
- **Full Content Control** — Admins can edit and delete any post regardless of ownership

### System
- **Role-Based Access Control** — Route guards for authenticated and admin-only pages
- **Avatar System** — Distinct circular badge avatars for admin (👑) and user (📖) roles
- **Responsive Design** — Mobile-first layout with hamburger navigation menus
- **localStorage Persistence** — All users, posts, and session data stored with `ws_` key prefix
- **Hardcoded Admin** — Default admin account (`admin` / `admin123`) initialized on first load

## Tech Stack

| Technology | Purpose |
|---|---|
| [React 18](https://react.dev/) | UI library |
| [Vite 5](https://vitejs.dev/) | Build tool and dev server |
| [Tailwind CSS 3](https://tailwindcss.com/) | Utility-first CSS framework |
| [React Router v6](https://reactrouter.com/) | Client-side routing |
| [uuid](https://www.npmjs.com/package/uuid) | Unique ID generation |
| [PropTypes](https://www.npmjs.com/package/prop-types) | Runtime prop validation |
| [Vitest](https://vitest.dev/) | Unit and integration testing |
| [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) | Component testing |
| localStorage | Client-side data persistence |

## Folder Structure

```
writespace-blog/
├── index.html
├── package.json
├── vite.config.js
├── vitest.config.js
├── tailwind.config.js
├── postcss.config.js
├── vercel.json
├── .env.example
├── .gitignore
├── CHANGELOG.md
├── README.md
└── src/
    ├── main.jsx                  # App entry point
    ├── App.jsx                   # Router and route definitions
    ├── index.css                 # Tailwind directives
    ├── setupTests.js             # Test setup (jest-dom)
    ├── components/
    │   ├── Avatar.jsx            # Role-based avatar component and getAvatar utility
    │   ├── BlogCard.jsx          # Blog post summary card
    │   ├── Navbar.jsx            # Authenticated navigation bar
    │   ├── PublicNavbar.jsx      # Public-facing navigation bar
    │   ├── ProtectedRoute.jsx    # Route guard (auth + role check)
    │   ├── ProtectedRoute.test.jsx
    │   ├── StatCard.jsx          # Dashboard statistics card
    │   └── UserRow.jsx           # User management row/card
    ├── pages/
    │   ├── LandingPage.jsx       # Public landing page
    │   ├── LoginPage.jsx         # Login form
    │   ├── LoginPage.test.jsx
    │   ├── RegisterPage.jsx      # Registration form
    │   ├── RegisterPage.test.jsx
    │   ├── Home.jsx              # Authenticated blog listing
    │   ├── ReadBlog.jsx          # Full blog post view
    │   ├── WriteBlog.jsx         # Create/edit blog post form
    │   ├── AdminDashboard.jsx    # Admin overview dashboard
    │   └── UserManagement.jsx    # Admin user management
    └── utils/
        ├── auth.js               # Authentication functions
        ├── auth.test.js
        ├── storage.js            # localStorage CRUD operations
        └── storage.test.js
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm 9 or later

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd writespace-blog

# Install dependencies
npm install
```

### Development

```bash
# Start the development server on http://localhost:5173
npm run dev
```

### Build

```bash
# Create a production build in the dist/ directory
npm run build

# Preview the production build locally
npm run preview
```

### Testing

```bash
# Run all tests
npm test
```

## Default Admin Account

On first load, a default admin account is automatically created:

| Field | Value |
|---|---|
| Username | `admin` |
| Password | `admin123` |
| Display Name | Site Owner |
| Role | admin |

> This account cannot be deleted through the user management interface.

## Route Map

| Path | Component | Access |
|---|---|---|
| `/` | LandingPage | Public |
| `/login` | LoginPage | Public (redirects if authenticated) |
| `/register` | RegisterPage | Public (redirects if authenticated) |
| `/blogs` | Home | Authenticated |
| `/blogs/:id` | ReadBlog | Authenticated |
| `/write` | WriteBlog | Authenticated |
| `/edit/:id` | WriteBlog | Authenticated (owner or admin) |
| `/admin` | AdminDashboard | Admin only |
| `/admin/users` | UserManagement | Admin only |
| `*` | Redirect to `/` | — |

## Role-Based Access

| Action | User | Admin |
|---|---|---|
| View all posts | ✅ | ✅ |
| Read a post | ✅ | ✅ |
| Create a post | ✅ | ✅ |
| Edit own post | ✅ | ✅ |
| Edit any post | ❌ | ✅ |
| Delete own post | ✅ | ✅ |
| Delete any post | ❌ | ✅ |
| Access admin dashboard | ❌ | ✅ |
| Manage users | ❌ | ✅ |
| Create new users | ❌ | ✅ |
| Delete users | ❌ | ✅ |

## Design System

### Color Palette

- **Primary** — Violet scale (`primary-50` through `primary-950`)
- **Secondary** — Indigo scale (`secondary-50` through `secondary-950`)
- **Accent** — Fuchsia scale (`accent-50` through `accent-950`)
- **Surface** — Slate scale (`surface-50` through `surface-950`)

### Gradients

| Name | Value |
|---|---|
| `bg-gradient-primary` | `linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)` |
| `bg-gradient-accent` | `linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #d946ef 100%)` |
| `bg-gradient-surface` | `linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)` |

### Shadows

| Name | Usage |
|---|---|
| `shadow-card` | Default card elevation |
| `shadow-card-hover` | Elevated card on hover |
| `shadow-primary` | Primary action buttons |

### Typography

- **Sans** — Inter, system-ui, -apple-system, sans-serif
- **Serif** — Merriweather, Georgia, serif
- **Mono** — Fira Code, monospace

### Components

- Rounded corners use `rounded-xl` (0.75rem) and `rounded-2xl` (1rem)
- Cards use white backgrounds with `border-surface-200` borders
- Blog cards feature a left accent border (`border-l-4 border-l-primary-500`)
- Buttons use gradient backgrounds with `shadow-primary` and `hover:opacity-90`
- Form inputs use `rounded-xl` with `focus:ring-2 focus:ring-primary-500`

## localStorage Keys

| Key | Description |
|---|---|
| `ws_users` | Array of user objects (id, username, displayName, password, role) |
| `ws_posts` | Array of post objects (id, title, content, excerpt, authorId, authorName, authorRole, createdAt) |
| `ws_session` | Current session object (userId, username, role, displayName) |

## Deployment

### Vercel

The project includes a `vercel.json` configuration with SPA rewrite rules. To deploy:

1. Push the repository to GitHub
2. Import the project in [Vercel](https://vercel.com/)
3. Vercel will auto-detect Vite and configure the build settings
4. Deploy — the SPA rewrites ensure all routes resolve to `index.html`

Build settings (auto-detected):

| Setting | Value |
|---|---|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

### Environment Variables

No environment variables are required. All data is stored in the browser's localStorage. An optional `VITE_APP_TITLE` variable can be set to customize the application title (see `.env.example`).

## License

Private