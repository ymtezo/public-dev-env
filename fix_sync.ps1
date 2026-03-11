$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

$GITHUB_USERNAME = "ymtezo"

# Clean workflow YAML (ASCII only, no Japanese comments)
$workflow = "name: Sync to GitLab`n"
$workflow += "`n"
$workflow += "on:`n"
$workflow += "  push:`n"
$workflow += "    branches: [""*""]`n"
$workflow += "    tags: [""*""]`n"
$workflow += "  workflow_dispatch:`n" # 手動実行用トリガーを追加
$workflow += "`n"
$workflow += "jobs:`n"
$workflow += "  sync:`n"
$workflow += "    runs-on: ubuntu-latest`n"
$workflow += "    steps:`n"
$workflow += "      - name: Checkout source`n"
$workflow += "        uses: actions/checkout@v4`n"
$workflow += "        with:`n"
$workflow += "          fetch-depth: 0`n"
$workflow += "`n"
$workflow += "      - name: Sync to GitLab`n"
$workflow += "        shell: bash`n"
$workflow += "        env:`n"
$workflow += '          GITLAB_TOKEN: ${{ secrets.GITLAB_TOKEN }}' + "`n"
$workflow += '          GITLAB_REPO: ${{ secrets.GITLAB_REPO }}' + "`n"
$workflow += "        run: |`n"
$workflow += '          git remote remove gitlab 2>/dev/null || true' + "`n"
$workflow += '          CLEAN_URL=$(echo "$GITLAB_REPO" | sed ''s|https://||'')' + "`n"
$workflow += '          AUTH_URL="https://oauth2:${GITLAB_TOKEN}@${CLEAN_URL}"' + "`n"
$workflow += '          git branch -r | grep -v ''\->'' | while read -r remote; do' + "`n"
$workflow += '            branch="${remote#origin/}"' + "`n"
$workflow += '            git branch -f "$branch" "$remote" 2>/dev/null || true' + "`n"
$workflow += "          done`n"
$workflow += '          git push --all --force "$AUTH_URL"' + "`n"
$workflow += '          git push --tags --force "$AUTH_URL"' + "`n"

$encoded = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($workflow))

# Active repos only
$reposJson = gh repo list $GITHUB_USERNAME --limit 100 --json name,isArchived,isEmpty --jq ".[] | select(.isArchived == false and .isEmpty == false) | .name"
$repos = $reposJson -split "`n" | Where-Object { $_.Trim() -ne "" }

Write-Host "Updating $($repos.Count) repositories..."
Write-Host ""

foreach ($name in $repos) {
    Write-Host "[$name] " -NoNewline

    # Get default branch
    $viewJson = gh repo view "$GITHUB_USERNAME/$name" --json defaultBranchRef 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "SKIP (failed to get info)"
        continue
    }
    
    $obj = $viewJson | ConvertFrom-Json
    $defaultBranch = $obj.defaultBranchRef.name

    if (-not $defaultBranch) {
        Write-Host "SKIP (no default branch)"
        continue
    }

    # Get existing file SHA
    $sha = $null
    try {
        $fileJson = gh api "repos/$GITHUB_USERNAME/$name/contents/.github/workflows/sync-to-gitlab.yml" 2>$null
        $sha = ($fileJson | ConvertFrom-Json).sha
    } catch {}

    if ($sha) {
        gh api --method PUT "repos/$GITHUB_USERNAME/$name/contents/.github/workflows/sync-to-gitlab.yml" `
            -f message="fix: clean workflow file encoding & logic" `
            -f content="$encoded" `
            -f branch="$defaultBranch" `
            -f sha="$sha" --silent 2>$null
    } else {
        gh api --method PUT "repos/$GITHUB_USERNAME/$name/contents/.github/workflows/sync-to-gitlab.yml" `
            -f message="feat: add GitLab sync workflow" `
            -f content="$encoded" `
            -f branch="$defaultBranch" --silent 2>$null
    }

    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK" -ForegroundColor Green
    } else {
        Write-Host "FAILED" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Done!"
