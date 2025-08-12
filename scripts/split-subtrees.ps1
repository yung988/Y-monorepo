param(
    [string]$BackendRepo,
    [string]$FrontendRepo,
    [string]$BackendBranch = "main",
    [string]$FrontendBranch = "main",
    [switch]$DryRun
)

# Split a subdirectory and push to a remote URL
function Split-And-Push {
    param(
        [Parameter(Mandatory=$true)][string]$Prefix,
        [Parameter(Mandatory=$true)][string]$RemoteUrl,
        [Parameter(Mandatory=$true)][string]$Branch,
        [switch]$DryRun
    )

    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Error "git is not installed or not available in PATH."
        exit 1
    }

    if ([string]::IsNullOrWhiteSpace($RemoteUrl)) {
        Write-Error "Remote URL is empty for prefix '$Prefix'."
        exit 1
    }

    $tmpBranch = ("split/" + ($Prefix -replace "[^a-zA-Z0-9_-]", "-")).ToLower()

    Write-Host "==> Creating split branch from prefix '$Prefix' into '$tmpBranch'..." -ForegroundColor Cyan
    if ($DryRun) {
        Write-Host "DRY-RUN: git subtree split --prefix=$Prefix -b $tmpBranch" -ForegroundColor Yellow
    } else {
        # Delete local temp branch if already exists
        $exists = git branch --list $tmpBranch
        if ($LASTEXITCODE -eq 0 -and $exists) {
            git branch -D $tmpBranch | Out-Null
        }
        git subtree split --prefix=$Prefix -b $tmpBranch
        if ($LASTEXITCODE -ne 0) {
            Write-Error "git subtree split failed for prefix '$Prefix'"
            exit 1
        }
    }

    Write-Host "==> Pushing split branch '$tmpBranch' to $RemoteUrl:$Branch ..." -ForegroundColor Cyan
    if ($DryRun) {
        Write-Host "DRY-RUN: git push $RemoteUrl $tmpBranch`:$Branch --force" -ForegroundColor Yellow
    } else {
        git push $RemoteUrl "$tmpBranch`:$Branch" --force
        if ($LASTEXITCODE -ne 0) {
            Write-Error "git push failed to '$RemoteUrl'"
            exit 1
        }
        # Cleanup temp branch
        git branch -D $tmpBranch | Out-Null
    }

    Write-Host "==> Done for '$Prefix'" -ForegroundColor Green
}

Write-Host "Ymonorepo splitter: create standalone GitHub repos for Y-backend and Y-frontend" -ForegroundColor Green
Write-Host "Working directory: $(Get-Location)" -ForegroundColor DarkGray

# If parameters not provided, try environment variables
if (-not $BackendRepo) { $BackendRepo = $env:BACKEND_REPO_URL }
if (-not $FrontendRepo) { $FrontendRepo = $env:FRONTEND_REPO_URL }
if (-not $BackendBranch) { $BackendBranch = if ($env:BACKEND_BRANCH) { $env:BACKEND_BRANCH } else { "main" } }
if (-not $FrontendBranch) { $FrontendBranch = if ($env:FRONTEND_BRANCH) { $env:FRONTEND_BRANCH } else { "main" } }

$didSomething = $false

if ($BackendRepo) {
    Split-And-Push -Prefix "Y-backend" -RemoteUrl $BackendRepo -Branch $BackendBranch -DryRun:$DryRun
    $didSomething = $true
} else {
    Write-Host "(Info) BackendRepo not provided. Skipping Y-backend." -ForegroundColor DarkYellow
}

if ($FrontendRepo) {
    Split-And-Push -Prefix "Y-frontend" -RemoteUrl $FrontendRepo -Branch $FrontendBranch -DryRun:$DryRun
    $didSomething = $true
} else {
    Write-Host "(Info) FrontendRepo not provided. Skipping Y-frontend." -ForegroundColor DarkYellow
}

if (-not $didSomething) {
    Write-Host @"
Usage:
  powershell -ExecutionPolicy Bypass -File .\scripts\split-subtrees.ps1 -BackendRepo https://github.com/<user>/Y-backend.git -FrontendRepo https://github.com/<user>/Y-frontend.git

Options:
  -BackendRepo <url>       Git remote URL for backend (e.g., https://github.com/org/Y-backend.git)
  -FrontendRepo <url>      Git remote URL for frontend (e.g., https://github.com/org/Y-frontend.git)
  -BackendBranch <name>    Target branch name for backend (default: main)
  -FrontendBranch <name>   Target branch name for frontend (default: main)
  -DryRun                  Show git commands without executing

Environment variables (alternative):
  BACKEND_REPO_URL, FRONTEND_REPO_URL, BACKEND_BRANCH, FRONTEND_BRANCH

Examples:
  # Split and push both:
  powershell -ExecutionPolicy Bypass -File .\scripts\split-subtrees.ps1 -BackendRepo https://github.com/org/Y-backend.git -FrontendRepo https://github.com/org/Y-frontend.git

  # Only backend:
  powershell -ExecutionPolicy Bypass -File .\scripts\split-subtrees.ps1 -BackendRepo https://github.com/org/Y-backend.git

  # Dry run:
  powershell -ExecutionPolicy Bypass -File .\scripts\split-subtrees.ps1 -BackendRepo https://github.com/org/Y-backend.git -DryRun
"@ -ForegroundColor White
}
