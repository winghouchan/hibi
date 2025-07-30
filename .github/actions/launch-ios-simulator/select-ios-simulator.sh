#!/usr/bin/env bash
set -e

devices=$(xcrun simctl list devices --json | jq ".devices")

echo "Available devices: $devices"

filter="to_entries | map(select(.key | contains(\"$os-${os_version//[.]/-}\"))) | .[0].value | map(select(.name == \"$model\")) | .[0].udid"

echo "Finding device with filter: $filter"

udid=$(echo "$devices" | jq "$filter")

echo "Device found with UDID: $udid"

echo "udid=$udid" >> $GITHUB_OUTPUT
