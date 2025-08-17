#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

shard_by_feature() {
  # Assumes the working directory is the `e2e/tests` directory
  find ./* \
    -maxdepth 0 \
    -type d \
    ! -path '*__subflows__*' \
    -exec sh -c 'printf "%s\n" "${1#./}"' sh {} \;
}

convert_to_json_array() {
  jq --compact-output --raw-input --slurp 'split("\n")[:-1]'
}

shards=$(shard_by_feature | convert_to_json_array)

echo "shards=$shards" >> "$GITHUB_OUTPUT"