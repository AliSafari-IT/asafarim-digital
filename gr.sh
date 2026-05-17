# Git force my branch to match origin/main
echo "Fetching origin..."
git fetch origin
echo "Resetting to origin/main..."
git reset --hard origin/main
echo "Done!"
git pull

chmod +x gr.sh
