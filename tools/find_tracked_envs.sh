#!/usr/bin/env bash
# List any .env files that are currently tracked by git (print nothing if none)
# Usage: bash tools/find_tracked_envs.sh
set -euo pipefail

echo "Searching for tracked .env files in git index..."
found=false
# Use git pathspecs to match common env filenames
while IFS= read -r file; do
  if [ -n "$file" ]; then
    echo "Tracked: $file"
    found=true
  fi
done < <(git ls-files -- "*.env" "*.env.*" "**/.env" || true)

if [ "$found" = false ]; then
  echo "No tracked .env files found."
fi
