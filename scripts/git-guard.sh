#!/usr/bin/env bash
# Git Index Self-Healing Safeguard Script
# Prevents and automatically heals "fatal: .git/index: index file smaller than expected"

set -e
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
GIT_DIR="${REPO_ROOT}/.git"
INDEX_FILE="${GIT_DIR}/index"
BAK_FILE="${GIT_DIR}/index.bak"

if [ ! -d "$GIT_DIR" ]; then
  exit 0
fi

# Function to check index health
check_and_heal() {
  if [ -f "$INDEX_FILE" ]; then
    INDEX_SIZE=$(stat -f%z "$INDEX_FILE" 2>/dev/null || stat -c%s "$INDEX_FILE" 2>/dev/null || echo 0)
    
    # Git index header + checksum is minimum 32 bytes; normal repo index is 4KB+
    if [ "$INDEX_SIZE" -lt 64 ]; then
      echo "⚠️ Detected corrupted or truncated .git/index (${INDEX_SIZE} bytes). Auto-healing..."
      
      if [ -f "$BAK_FILE" ] && [ "$(stat -f%z "$BAK_FILE" 2>/dev/null || echo 0)" -gt 64 ]; then
        cp -p "$BAK_FILE" "$INDEX_FILE"
        echo "✅ Restored .git/index from healthy backup ($BAK_FILE)."
      else
        rm -f "$INDEX_FILE" "${GIT_DIR}/index.lock"
        git reset --quiet 2>/dev/null || true
        echo "✅ Regenerated .git/index via git reset."
      fi
    else
      # Index is healthy; keep backup fresh
      cp -p "$INDEX_FILE" "$BAK_FILE" 2>/dev/null || true
    fi
  else
    if [ -f "$BAK_FILE" ]; then
      cp -p "$BAK_FILE" "$INDEX_FILE"
    else
      git reset --quiet 2>/dev/null || true
    fi
  fi
}

case "$1" in
  heal)
    check_and_heal
    ;;
  backup)
    if [ -f "$INDEX_FILE" ] && [ "$(stat -f%z "$INDEX_FILE" 2>/dev/null || echo 0)" -gt 64 ]; then
      cp -p "$INDEX_FILE" "$BAK_FILE" 2>/dev/null || true
    fi
    ;;
  *)
    check_and_heal
    ;;
esac
