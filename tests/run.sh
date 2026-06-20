#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

PASS=0
FAIL=0

tail -n +2 "$SCRIPT_DIR/tests.csv" | while IFS=',' read -r id description command check; do
  echo "[$id] $description"

  (cd "$REPO_DIR" && eval "$command" > /dev/null 2>&1)

  if (cd "$REPO_DIR" && eval "$check"); then
    echo "     PASS"
    PASS=$((PASS + 1))
  else
    echo "     FAIL"
    FAIL=$((FAIL + 1))
  fi
done

echo ""
echo "Done."
