#!/usr/bin/env bash
set -Eeuo pipefail

APPLY=0
if [[ "${1:-}" == "--apply" || "${1:-}" == "-a" ]]; then
  APPLY=1
fi

# Resolve repo root (parent of this script dir)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

printf "Repo root: %s\n" "$REPO_ROOT" >&2

# Helper to print or remove
maybe_remove() {
  local path="$1"
  if [[ $APPLY -eq 1 ]]; then
    if [[ -d "$path" ]]; then
      rm -rf -- "$path" && echo "Removed dir: $path" || echo "[warn] Failed to remove dir: $path"
    elif [[ -f "$path" ]]; then
      rm -f -- "$path" && echo "Removed file: $path" || echo "[warn] Failed to remove file: $path"
    fi
  else
    echo "[dry-run] Would remove: $path"
  fi
}

# Initialize arrays to avoid unbound variable errors on some shells
DIRS=()
FILES=()

# Collect directories to delete (exclude node_modules)
mapfile -d '' DIRS < <(find "$REPO_ROOT" \
  -path "*/node_modules/*" -prune -o -name node_modules -prune -o \
  -type d \
  \( -name bin -o -name obj -o -name dist -o -name build -o -name .next -o -name .nuxt -o -name out -o -name coverage -o -name .parcel-cache -o -name .cache -o -name .turbo -o -name .vite -o -name .angular -o -name .svelte-kit -o -name __pycache__ -o -name .pytest_cache -o -name .mypy_cache -o -name tmp -o -name temp \) \
  -print0) || true

# Collect files to delete (exclude node_modules)
mapfile -d '' FILES < <(find "$REPO_ROOT" \
  -path "*/node_modules/*" -prune -o -name node_modules -prune -o \
  -type f \
  \( -name "*.log" -o -name "*.tmp" -o -name "*.cache" -o -name ".DS_Store" -o -name "server.log" \) \
  -print0) || true

DIR_COUNT=${#DIRS[@]}
FILE_COUNT=${#FILES[@]}
echo "Found $DIR_COUNT directories and $FILE_COUNT files to clean." 
if [[ $DIR_COUNT -eq 0 && $FILE_COUNT -eq 0 ]]; then
  echo "Nothing to clean. You're all set."
  exit 0
fi

# Remove files first
for f in "${FILES[@]:-}"; do
  [[ -n "$f" ]] || continue
  maybe_remove "$f"
done

# Remove directories deepest-first to avoid parent/child ordering issues
if [[ $DIR_COUNT -gt 0 ]]; then
  # Print with length prefix, sort desc, strip length
  while IFS= read -r -d '' d; do
    printf "%06d %s\0" "${#d}" "$d"
  done < <(printf '%s\0' "${DIRS[@]}") | \
  sort -z -r | \
  cut -z -c8- | \
  while IFS= read -r -d '' d2; do
    maybe_remove "$d2"
  done
fi

echo "Cleanup completed." 
if [[ $APPLY -eq 0 ]]; then
  echo "Dry run only. Re-run with --apply to delete."
fi
