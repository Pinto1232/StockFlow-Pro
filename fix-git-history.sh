#!/bin/bash

# Git History Security Fix Script
# This script removes GitHub Personal Access Tokens from Git history

echo "🛡️ Starting Git history security fix..."

# The actual token that needs to be removed (from the error message)
SECRET_TOKEN="YOUR_GITHUB_TOKEN_HERE"
REPLACEMENT_TEXT="[REDACTED - Set via environment variable]"

echo "📋 Files to be cleaned from history:"
echo "  - NUGET_SETUP_COMPLETE.md"
echo "  - SECURITY_FIX_SUMMARY.md"

# Create a backup branch first
echo "💾 Creating backup branch..."
git branch backup-before-history-rewrite

# Method 1: Using git filter-branch (more widely available)
echo "🔧 Rewriting Git history to remove secrets..."

# Remove the secret from NUGET_SETUP_COMPLETE.md
git filter-branch --force --tree-filter "
if [ -f 'NUGET_SETUP_COMPLETE.md' ]; then
    sed -i 's/${SECRET_TOKEN}/${REPLACEMENT_TEXT}/g' NUGET_SETUP_COMPLETE.md
fi
" --prune-empty -- --all

# Remove the secret from SECURITY_FIX_SUMMARY.md  
git filter-branch --force --tree-filter "
if [ -f 'SECURITY_FIX_SUMMARY.md' ]; then
    sed -i 's/${SECRET_TOKEN}/[REDACTED_TOKEN]/g' SECURITY_FIX_SUMMARY.md
fi
" --prune-empty -- --all

echo "🧹 Cleaning up Git references..."
# Clean up the filter-branch refs
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo "✅ Git history has been rewritten!"
echo ""
echo "🚀 Next steps:"
echo "1. Verify the changes: git log --oneline"
echo "2. Force push to update remote: git push --force-with-lease origin Azure-devOps-nuGet-setup"
echo ""
echo "⚠️  WARNING: This rewrites Git history. All collaborators will need to re-clone the repository."
echo ""
echo "🔍 To verify secrets are removed, run:"
echo "   git log --all --full-history -- '*' | grep -i 'ghp_'"
echo ""