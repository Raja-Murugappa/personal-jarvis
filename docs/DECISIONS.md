## 2026-11-01: React Router audit warnings
- npm audit shows 2 moderate advisories in react-router (open redirect, SSR hydration).
- Not applicable: no SSR, no redirects built from user input, app runs only on localhost.
- Decision: leave as is. Recheck before Tauri packaging.