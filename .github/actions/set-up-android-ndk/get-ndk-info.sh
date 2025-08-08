#!/usr/bin/env bash
set -e

# The following command attempts to get the `ndkVersion` from the root project's
# properties; however, that version isn't actually significant due to sub-projects
# possibly configuring their own version or use the default version for the Android
# Gradle Plugin. As a result, the Gradle command is configured to run in offline
# mode, which stops any attempts to install other NDK versions. The output/errors
# are then parsed to look for requested NDK versions.
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
