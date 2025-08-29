#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

bundle_identifier=$1
project_root=$(git rev-parse --show-toplevel)
action_directory=$(dirname "${BASH_SOURCE[0]}")

yarn run expo export --platform ios

bun "${action_directory}/server" &

xcrun simctl launch booted "${bundle_identifier}"

app_data_container_directory=$(xcrun simctl get_app_container booted "${bundle_identifier}" data)
app_support_directory="${app_data_container_directory}/Library/Application Support"
temp_directory="${project_root}/e2e/bundle/tmp"
bundle_directory_name=".expo-internal"
app_bundle_directory="${app_support_directory}/${bundle_directory_name}"
temp_bundle_directory="${temp_directory}/${bundle_directory_name}"

timeout=30 # seconds
elapsed=0 # seconds

while [ ! -d "${app_bundle_directory}" ] && [ "${elapsed}" -lt "${timeout}" ]; do
  sleep 1
  elapsed=$((elapsed + 1))
done

if [ -d "${app_bundle_directory}" ]; then
  rm -rf "${temp_directory}"
  mkdir "${temp_directory}"
  cp -R "${app_bundle_directory}" "${temp_bundle_directory}"
else
  echo "Timed out waiting for bundle in ${app_bundle_directory}"
  exit 1
fi

trap 'kill $(jobs -p)' EXIT
