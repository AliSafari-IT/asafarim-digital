# Git force my branch to match origin/main
Write-Host "Fetching origin..."
git fetch origin
Write-Host "Resetting to origin/main..."
git reset --hard origin/main
Write-Host "Done!"
