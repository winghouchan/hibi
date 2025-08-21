#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

group=feature

while [ $# -gt 0 ]; do
  case "$1" in
    -g | --group)
      group="$2"
      shift 2
      ;;
    * )
      break
      ;;
  esac
done

shard_by_feature() {
  # Assumes the working directory is the `e2e/tests` directory
  find ./* \
    -maxdepth 0 \
    -type d \
    ! -path '*__subflows__*' \
    -exec sh -c 'printf "%s\n" "${1#./}"' sh {} \;
}

shard_into_number_of_groups() {
  local number_of_groups=$1

  # Assumes the working directory is the `e2e/tests` directory
  local test_paths
  test_paths=$(find ./* \
    -name '*.yaml' \
    ! -name 'config.yaml' \
    ! -path '*__subflows__*' \
    -exec sh -c 'printf "%s\n" "${1#./}"' sh {} \;
  )

  local count
  count=$(echo "$test_paths" | wc -l)

  local group_size=$(((count + number_of_groups - 1) / number_of_groups))

  echo "$test_paths" | xargs -n "$group_size"
}

shard() {
  if [[ "$group" =~ ^[0-9]+$ ]] && [ "$group" -gt 0 ]; then
    shard_into_number_of_groups "$group"
  else
    shard_by_feature
  fi
}

to_json() {
  jq \
    --compact-output \
    --raw-input \
    --slurp \
    'split("\n")[:-1] 
      | to_entries
      | map({ name: ("shard-" + (.key | tostring)), tests: .value})'
}

shards=$(shard | to_json)

if [ "${CI:-}" == "true" ]; then
  echo "shards=$shards" >> "$GITHUB_OUTPUT"
else
  echo "$shards"
fi
