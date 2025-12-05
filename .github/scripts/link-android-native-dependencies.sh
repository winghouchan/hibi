#!/usr/bin/env bash

# React Native generates some files during [auto-linking][1]:
#
# - `autolinking.json`: A file with some information about dependencies that
#    are auto-linked.
# - `package.json.sha`: A hash of the `package.json`, to help indicate if
#    the auto-linking information is out of date.
# - `yarn.lock.sha`: A hash of the `yarn.lock`, to help indicate if the
#    auto-linking information is out of date.
#
# This part of auto-linking is performed in the `settings.gradle` file, see
# calls to the `ex.autolinkLibrariesFromCommand` function. This, however,
# causes a problem when used in combination with the Gradle configuration
# cache in CI:
#
# 1. After `expo prebuild` has been run, the contents of the above files is just
#    a template. Auto-linking has not populated them with project-relevant data
#    yet.
# 2. Once the build command is executed, calling Gradle assemble tasks, the
#    `settings.gradle` file is run, performing this part of the auto-linking
#    process. The state of the above files, before auto-linking, is captured
#    as inputs to the Gradle configuration cache.
# 3. In subsequent runs, there may be a Gradle configuration cache hit, which
#    stops `settings.gradle` from being run. This results in auto-linking not
#    being performed, causing runtime errors.
#
# To solve this problem, this step generates those files. The method has been
# determined by reading the [source][2] of the Gradle plugin that does this.
#
# [1]: https://docs.expo.dev/modules/autolinking/
# [2]: https://github.com/facebook/react-native/blob/b75031f3ddeb2034e219d0ec541914ccdc2b2c8c/packages/gradle-plugin/settings-plugin/src/main/kotlin/com/facebook/react/ReactSettingsExtension.kt

set -o errexit
set -o nounset
set -o pipefail

# Get auto-linking configuration. Uses the `react-native-config` command from
# `expo-modules-autolinking`. It outputs a JavaScript object with highlighting
# of syntax using ANSI escape codes.
#
# See: https://docs.expo.dev/modules/autolinking/#react-native-config
get_autolinking_config() {
  yarn run expo-modules-autolinking react-native-config --platform android
}

strip_ansi_codes() {
  sed 's/\x1B\[[0-9;]\{1,\}[A-Za-z]//g'
}

convert_to_json() {
  # Disable `SC2016 (info)` for expressions not expanding inside single quotes.
  # The JavaScript in this string should be preserved as is to stop it being
  # misinterpretated as having a parameter expansion.
  # shellcheck disable=SC2016
  node --print 'JSON.stringify(eval(`(${require("fs").readFileSync(0, "utf8")})`))'
}

get_checksum() {
  local file=$1

  # The checksum is output in the format `<checksum>  <file_name>\n`
  local sha256sum_output
  sha256sum_output=$(sha256sum "${file}")

  # Extracts the checksum from the output of `sha256sum`
  local checksum
  checksum=$(echo "${sha256sum_output}" | awk '{print $1}')

  # Outputs the checksum without a trailing new line
  echo -n "${checksum}"
}

autolinking_directory=android/build/generated/autolinking

mkdir -p "${autolinking_directory}"

get_autolinking_config | strip_ansi_codes | convert_to_json \
  > "${autolinking_directory}/autolinking.json"

get_checksum package.json > "${autolinking_directory}/package.json.sha"

get_checksum yarn.lock > "${autolinking_directory}/yarn.lock.sha"
