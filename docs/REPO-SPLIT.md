# Splitting Y-backend and Y-frontend into separate GitHub repositories

This monorepo contains two top-level projects:
- `Y-backend`
- `Y-frontend`

If you want each of them to live in its own GitHub repository (for example to connect each one to a separate Vercel project), use the provided PowerShell script which uses `git subtree` under the hood.

## Prerequisites
- Windows PowerShell
- Git installed and available in PATH
- This repository committed (no need to be clean, but recommended)
- Two empty GitHub repositories you own, e.g.:
  - https://github.com/<you>/Y-backend
  - https://github.com/<you>/Y-frontend

## One-liner for both repos
Open PowerShell in the repository root and run:

```
powershell -ExecutionPolicy Bypass -File .\scripts\split-subtrees.ps1 -BackendRepo https://github.com/<you>/Y-backend.git -FrontendRepo https://github.com/<you>/Y-frontend.git
```

This will:
1. Create a temporary split branch from `Y-backend` and push it to the `main` branch of the provided backend repo.
2. Create a temporary split branch from `Y-frontend` and push it to the `main` branch of the provided frontend repo.
3. Remove the temporary split branches locally.

## Split only one side
- Backend only:
```
powershell -ExecutionPolicy Bypass -File .\scripts\split-subtrees.ps1 -BackendRepo https://github.com/<you>/Y-backend.git
```
- Frontend only:
```
powershell -ExecutionPolicy Bypass -File .\scripts\split-subtrees.ps1 -FrontendRepo https://github.com/<you>/Y-frontend.git
```

## Custom branch name
By default, the target branch is `main`. You can change it:
```
powershell -ExecutionPolicy Bypass -File .\scripts\split-subtrees.ps1 -BackendRepo https://github.com/<you>/Y-backend.git -BackendBranch production
```

## Using environment variables
Instead of parameters, you can set environment variables:
- `BACKEND_REPO_URL`, `FRONTEND_REPO_URL`
- `BACKEND_BRANCH`, `FRONTEND_BRANCH`

Then run:
```
powershell -ExecutionPolicy Bypass -File .\scripts\split-subtrees.ps1
```

## Dry run (no changes)
Preview commands without executing:
```
powershell -ExecutionPolicy Bypass -File .\scripts\split-subtrees.ps1 -BackendRepo https://github.com/<you>/Y-backend.git -DryRun
```

## After splitting: connect to Vercel
1. In Vercel, create a new project and import from GitHub.
2. Choose the backend repo for the backend project and the frontend repo for the frontend project.
3. Since each repo now has the correct root (`/`), you don’t need to set a monorepo Root Directory.
4. Configure environment variables in Vercel (copy them from your local `.env` files as needed). Never commit secrets to Git.
5. Set the appropriate build & output settings depending on your frameworks (Next.js is auto-detected).

## Notes
- `git subtree` preserves history for the subdirectory.
- The script forces push to the target branch. If you prefer not to force push, remove `--force` in the script.
- You can re-run the script any time; it will regenerate the split based on your latest monorepo state.
