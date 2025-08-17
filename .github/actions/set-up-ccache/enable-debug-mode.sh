#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

debug_directory=$GITHUB_WORKSPACE/.ccache/debug

{
  echo "CCACHE_DEBUG=1"
  echo "CCACHE_DEBUGDIR=$debug_directory"
  echo "CCACHE_DEBUGLEVEL=1"
} >> "$GITHUB_ENV"

echo "directory=$debug_directory" >> "$GITHUB_OUTPUT"
