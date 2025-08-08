#!/usr/bin/env bash
set -e

versions=$(./gradlew --console=plain --offline --quiet :properties --property ndkVersion 2>&1 |
  sed -En -e 's/\x1B\[[0-9;]*[mK]//g' -e 's/.*ndk[^0-9]*([0-9]+\.[0-9]+\.[0-9]+).*/\1/Ip' |
  jq --compact-output --raw-input --slurp 'split("\n")[:-1]')

echo "Android NDK versions: $versions"

paths=$(echo $versions | jq --compact-output --arg path '/usr/local/lib/android/sdk/ndk/' '[.[] | $path + .]')

echo "Android NDK paths: $paths"

echo "versions=$versions" >> $GITHUB_OUTPUT
{
  echo "paths<<EOF" 
  echo "$paths" | jq --raw-output '.[]'
  echo "EOF"
} >> $GITHUB_OUTPUT
