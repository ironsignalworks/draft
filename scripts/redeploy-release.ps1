param(
  [Parameter(Mandatory = $true)]
  [string]$ReleaseRef
)

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Error "GitHub CLI (gh) is required. Install gh and authenticate before running rollback."
  exit 1
}

gh workflow run rollback-pages.yml -f release_ref="$ReleaseRef"
