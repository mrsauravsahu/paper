#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

find "$SCRIPT_DIR" -maxdepth 1 ! -name "*.md" ! -name "*.csv" ! -name "*.sh" ! -name "$(basename "$SCRIPT_DIR")" -delete
