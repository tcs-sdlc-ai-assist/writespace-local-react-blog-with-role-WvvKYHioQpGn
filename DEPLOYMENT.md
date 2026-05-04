# Deployment Guide

This document covers deploying WriteSpace to production using Vercel, including configuration details, environment variables, and troubleshooting common issues.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Vercel Deployment](#vercel-deployment)
  - [Initial Setup](#initial-setup)
  - [Auto-Deploy via CI/CD](#auto-deploy-via-cicd)
  - [Manual Deployment](#manual-deployment)
- [Build Configuration](#build-configuration)
- [SPA Rewrite Configuration](#spa-rewrite-configuration)
- [Environment Variables](#environment-variables)
- [Output Directory](#output-directory)
- [Troubleshooting](#troubleshooting)
  - [SPA Routing Issues](#spa-routing-issues)
  - [Blank Page After Deployment](#blank-page-after-deployment)
  - [Build Failures](#build-failures)
  - [Static Assets Not Loading](#static-assets-not-loading)
  - [localStorage Limitations](#localstorage-limitations)

---

## Prerequisites

Before deploying, ensure you have:

- [Node.js](https://nodejs.org/) 18 or later installed locally
- npm 9 or later
- A [GitHub](https://github.com/), [GitLab](https://gitlab.com/), or [Bitbucket](https://bitbucket.org/) repository containing the project
- A [Vercel](https://vercel.com/) account (free tier is sufficient)

Verify the project builds successfully before deploying:

```bash
npm install
npm run build
```

The production build output will be generated in the `dist/` directory.

---

## Vercel Deployment

### Initial Setup

1. **Push your repository** to GitHub, GitLab, or Bitbucket.

2. **Import the project in Vercel:**
   - Log in to [vercel.com](https://vercel.com/)
   - Click **"Add New…"** → **"Project"**
   - Select your Git provider and authorize access if prompted
   - Choose the `writespace-blog` repository from the list
   - Click **"Import"**

3. **Configure build settings:**

   Vercel auto-detects Vite projects and pre-fills the correct settings. Verify the following values before deploying:

   | Setting            | Value           |
   |--------------------|-----------------|
   | Framework Preset   | Vite            |
   | Build Command      | `npm run build` |
   | Output Directory   | `dist`          |
   | Install Command    | `npm install`   |
   | Node.js Version    | 18.x            |

4. **Deploy:**
   - Click **"Deploy"**
   - Vercel will install dependencies, run the build, and publish the site
   - Once complete, you will receive a production URL (e.g., `https://your-project.vercel.app`)

### Auto-Deploy via CI/CD

Once the project is connected to Vercel, continuous deployment is enabled automatically:

- **Production deploys** are triggered on every push to the `main` (or `master`) branch
- **Preview deploys** are triggered on every push to any other branch or on pull request creation
- Each preview deploy receives a unique URL for testing before merging

No additional CI/CD configuration is required. Vercel handles the entire pipeline:

1. Detects the push event from your Git provider
2. Clones the repository
3. Runs `npm install`
4. Runs `npm run build`
5. Deploys the contents of `dist/` to the Vercel CDN
6. Applies the SPA rewrite rules from `vercel.json`

To disable auto-deploy for specific branches, configure the **Git** settings in your Vercel project dashboard under **Settings** → **Git**.

### Manual Deployment

If you prefer to deploy without connecting a Git repository, use the [Vercel CLI](https://vercel.com/docs/cli):

```bash
# Install the Vercel CLI globally
npm install -g vercel

# Log in to your Vercel account
vercel login

# Deploy from the project root
vercel

# Deploy directly to production
vercel --prod
```

The CLI will prompt you to confirm the project settings on the first run.

---

## Build Configuration

The project uses [Vite](https://vitejs.dev/) as the build tool. The build configuration is defined in `vite.config.js`:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

Key build details:

| Property     | Value  | Description                                      |
|--------------|--------|--------------------------------------------------|
| `outDir`     | `dist` | Directory where production files are generated    |
| `sourcemap`  | `true` | Source maps are included for debugging in production |

To create a production build locally:

```bash
npm run build
```

To preview the production build locally before deploying:

```bash
npm run preview
```

This starts a local static server serving the `dist/` directory on `http://localhost:4173`.

---

## SPA Rewrite Configuration

WriteSpace is a single-page application (SPA) using client-side routing via React Router v6. All routes (e.g., `/blogs`, `/admin`, `/login`) are handled by JavaScript in the browser — there are no corresponding server-side files for these paths.

The `vercel.json` file at the project root configures Vercel to rewrite all requests to `index.html`, allowing React Router to handle routing:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**How it works:**

1. A user navigates to `https://your-app.vercel.app/blogs`
2. Vercel receives the request for `/blogs`
3. The rewrite rule matches `/blogs` against the pattern `/(.*)`
4. Vercel serves `index.html` instead of returning a 404
5. React Router reads the URL path (`/blogs`) and renders the correct component

Without this rewrite rule, directly visiting any route other than `/` would result in a **404 Not Found** error.

> **Note:** Static assets (JS, CSS, images, fonts) in the `dist/assets/` directory are served normally and are not affected by the rewrite rule. Vercel serves exact file matches before applying rewrites.

---

## Environment Variables

**No environment variables are required for deployment.** WriteSpace stores all data in the browser's `localStorage` and does not connect to any external APIs or databases.

An optional environment variable is available for customization:

| Variable         | Required | Default      | Description                        |
|------------------|----------|--------------|------------------------------------|
| `VITE_APP_TITLE` | No       | `WriteSpace` | Customize the application title    |

To set environment variables on Vercel:

1. Go to your project dashboard on [vercel.com](https://vercel.com/)
2. Navigate to **Settings** → **Environment Variables**
3. Add the variable name and value
4. Select which environments to apply it to (Production, Preview, Development)
5. Click **Save**

Environment variables prefixed with `VITE_` are embedded into the client-side bundle at build time and are accessible via `import.meta.env.VITE_*` in the source code. They are **not** secret — do not store sensitive values in `VITE_` variables.

For local development, copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

---

## Output Directory

The production build generates the following structure in `dist/`:

```
dist/
├── index.html          # Entry HTML file
├── vite.svg            # Favicon
└── assets/
    ├── index-[hash].js     # Bundled JavaScript
    ├── index-[hash].css    # Bundled CSS (Tailwind)
    └── index-[hash].js.map # Source map
```

- `index.html` is the single HTML entry point served for all routes
- JavaScript and CSS files include content hashes in their filenames for cache busting
- Source maps are generated alongside JS bundles for production debugging

---

## Troubleshooting

### SPA Routing Issues

**Symptom:** Navigating directly to a route like `/blogs` or `/admin` returns a 404 error.

**Cause:** The hosting platform is looking for a file at `/blogs/index.html` which does not exist. SPA routing requires all paths to be rewritten to `index.html`.

**Solution:**

1. Verify that `vercel.json` exists in the project root with the correct rewrite rule:

   ```json
   {
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

2. Ensure `vercel.json` is committed to your repository and not listed in `.gitignore`.

3. Redeploy the project after adding or modifying `vercel.json`.

4. If deploying to a platform other than Vercel, configure the equivalent rewrite rule:

   | Platform       | Configuration                                                                 |
   |----------------|-------------------------------------------------------------------------------|
   | Vercel         | `vercel.json` with `rewrites`                                                 |
   | Netlify        | `_redirects` file with `/* /index.html 200`                                   |
   | Apache         | `.htaccess` with `FallbackResource /index.html`                               |
   | Nginx          | `try_files $uri $uri/ /index.html`                                            |
   | GitHub Pages   | Custom 404.html that redirects to index.html                                  |

### Blank Page After Deployment

**Symptom:** The deployed site loads but shows a blank white page with no content.

**Possible causes and solutions:**

1. **Incorrect output directory:** Verify that Vercel is configured to use `dist` as the output directory, not `build` or `public`.

2. **JavaScript errors:** Open the browser developer console (F12 → Console tab) and check for errors. Common issues include:
   - Failed asset loading due to incorrect base path
   - Runtime errors in the application code

3. **Base path mismatch:** If deploying to a subdirectory (e.g., `https://example.com/app/`), add a `base` option to `vite.config.js`:

   ```js
   export default defineConfig({
     base: '/app/',
     // ...
   });
   ```

   For root-level deployments on Vercel, no `base` configuration is needed.

### Build Failures

**Symptom:** The Vercel deployment fails during the build step.

**Possible causes and solutions:**

1. **Node.js version mismatch:** Ensure the Vercel project is using Node.js 18 or later. Set this in **Settings** → **General** → **Node.js Version**.

2. **Missing dependencies:** Run `npm install` locally and verify that `package-lock.json` is committed to the repository. Vercel uses `package-lock.json` to install exact dependency versions.

3. **Build errors:** Run `npm run build` locally to reproduce the error. Fix any compilation or linting errors before pushing.

4. **Check build logs:** In the Vercel dashboard, click on the failed deployment and review the **Build Logs** tab for specific error messages.

### Static Assets Not Loading

**Symptom:** The page loads but styles are missing, images are broken, or JavaScript fails to execute.

**Possible causes and solutions:**

1. **Asset paths:** Vite generates hashed asset filenames and references them with relative paths in `index.html`. Verify that the `dist/assets/` directory contains the expected `.js` and `.css` files.

2. **Content Security Policy:** If your deployment environment enforces a Content Security Policy (CSP), ensure it allows loading scripts and styles from the same origin.

3. **Cache issues:** Hard-refresh the page (Ctrl+Shift+R or Cmd+Shift+R) to bypass the browser cache. Vite's content-hashed filenames should prevent stale cache issues on subsequent deployments.

### localStorage Limitations

**Symptom:** Data is lost between sessions, or the application behaves unexpectedly after storing many posts or users.

**Important considerations:**

1. **localStorage is browser-specific:** Data stored in localStorage is tied to the specific browser and device. Users will not see their data on a different browser or device.

2. **Storage limits:** Most browsers limit localStorage to approximately 5–10 MB per origin. If the limit is reached, new writes will fail silently (the application handles this gracefully).

3. **Private/incognito mode:** Some browsers restrict or disable localStorage in private browsing mode. The application will still function but data will not persist after the session ends.

4. **Clearing browser data:** Clearing browser data, cookies, or site data will permanently delete all WriteSpace data including user accounts, posts, and the active session.

5. **Multiple tabs:** WriteSpace reads from localStorage on component mount. Changes made in one tab may not be immediately reflected in another tab without a page refresh.