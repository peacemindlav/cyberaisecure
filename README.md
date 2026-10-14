# CyberAiSecure - Static Cybersecurity News & Threat Intelligence Portal

> A modern, responsive, static news and vulnerability dispatch portal for **CyberAiSecure** (`cyberaisecure.com`), engineered specifically for seamless deployment on **GitHub Pages**.

---

## Architectural Highlights

1. **Pure Static Site Compatibility:**
   - Built with **React 19 + TypeScript + Vite + Tailwind CSS**.
   - Compiles down to purely static assets (`dist/index.html`, CSS, and JS).
   - **Relative Asset Paths (`base: './'`):** Works out-of-the-box on either custom domains (e.g. `cyberaisecure.com/`) or GitHub project subdirectories (e.g. `username.github.io/repo-name/`).

2. **Clean Editorial Layout (Inspired by Leading Security News Outlets):**
   - High-contrast, clean news hierarchy with sticky navigation, live threat pulse ticker, lead story hero, primary news feed, and a balanced sidebar.
   - Zero ads, zero sponsored boxes, zero tracking scripts.
   - Balanced sidebar featuring:
     - **Trending Dispatches** (ranked 01–04)
     - **Active CVE Threat Index** (CVSS 3.1 scores, affected targets, patch statuses)
     - **Security Bulletin Newsletter** (clean capture without third-party ad widgets)
     - **Static JSON Data Feed Status** (`public/data/news.json`)

3. **Theme Management (Light by Default with Instant Dark Mode Toggle):**
   - Runs by default in a clean, professional **Light Theme**.
   - Persistent **Sun/Moon theme toggle** in the navigation header saved to `localStorage` (`cas_theme`).
   - Head-executed script in `index.html` evaluates theme before rendering, completely preventing Flash of Unstyled Content (FOUC).

4. **Modular & API-Ready Content Architecture:**
   - Ingests structured JSON from `public/data/news.json`.
   - Built-in asynchronous loader (`src/data/news.ts`) ready to connect to external REST endpoints or RSS feeds.

---

## Project Structure

```text
cyberaisecure/
├── public/
│   ├── data/
│   │   └── news.json            # Public JSON news feed (API-ready)
│   ├── CNAME                    # Custom domain (cyberaisecure.com)
│   ├── 404.html                 # SPA redirect fallback for GitHub Pages
│   └── robots.txt               # Crawler directives
├── src/
│   ├── components/
│   │   ├── Navbar.tsx           # Sticky nav, CyberAiSecure badge, search, Light/Dark toggle
│   │   ├── HeroFeatured.tsx     # Lead story hero card
│   │   ├── ArticleCard.tsx      # Clean news card (zero-pill metadata discipline)
│   │   ├── Sidebar.tsx          # Balanced ad-free sidebar (Trending, CVEs, Newsletter)
│   │   ├── ArticleModal.tsx     # Full story reader with code blocks & share action
│   │   ├── DeployModal.tsx      # In-app GitHub Pages deployment guide
│   │   └── Footer.tsx           # Editorial footer with coverage channels
│   ├── data/
│   │   └── news.ts              # Data layer & fetchArticles JSON loader
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces for news & CVEs
│   ├── App.tsx                  # Main news portal view & theme orchestration
│   ├── index.css                # Tailwind CSS v4 custom variant & scrollbars
│   └── main.tsx                 # React entry point
├── .github/
│   └── workflows/
│       └── deploy.yml           # Automated GitHub Pages CI/CD workflow
├── index.html                   # HTML shell with theme initialization script
├── vite.config.ts               # Vite configuration with base: './'
└── package.json
```

---

## Local Development & Build

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev

# Build production static bundle
npm run build

# Preview production build locally
npm run preview
```

---

## Deploying to GitHub Pages

1. **Commit and push** your code to your repository's `main` branch:
   ```bash
   git add -A
   git commit -m "feat: CyberAiSecure static portal layout with light/dark theme"
   git push origin main
   ```

2. Open your repository on GitHub and navigate to:
   **Settings → Pages**

3. Under **Build and deployment → Source**, choose:
   > **GitHub Actions**

4. GitHub Actions will run `.github/workflows/deploy.yml` and publish your site automatically in under 45 seconds.
