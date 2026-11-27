# Meobooks – Vite migration scaffold

This is a **technical scaffold only**, not the migrated application. The existing
single-file application and its data are not included or modified.

## Requirements
- Node.js 20+
- npm

## Local setup
1. Copy `.env.example` to `.env`.
2. Fill in the existing Supabase project URL and publishable/anon key.
3. Run:

   ```bash
   npm install
   npm run dev
   ```

## Build
```bash
npm run build
npm run preview
```

## Important migration safeguards
- Keep the existing `main` branch and deployed version unchanged while migrating.
- Do not run SQL migrations or alter Supabase tables/data as part of this scaffold.
- Move features one at a time and test login, local cache, cloud sync, and realtime
  behavior before considering deployment.
- The `base` value in `vite.config.js` assumes the GitHub Pages project path
  `/meobooks/`. Change it only if the repository's published URL uses another path.
- The workflow deploys on pushes to both `main` and `migration-vite`. Before enabling
  it, configure GitHub Pages to use **GitHub Actions** and consider restricting the
  workflow to `migration-vite` until the migration is verified.
