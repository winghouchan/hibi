#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

app_id=co.hibi.app.test
test_root_directory=e2e/tests

# Groups arguments by whether they are named or positional.
#
# Named arguments will be options for Maestro. Positional arguments will be
# names of end-to-end tests.
group_arguments() {
  local -n named_arguments=$1
  local -n positional_arguments=$2
  shift 2

  named_arguments=()
  positional_arguments=()

  while [[ $# -gt 0 ]]; do
    case "$1" in
      # End of named arguments marker
      --)
        # Removes the `--` from the argument list
        shift

        # All remaining arguments will be positional arguments
        positional_arguments+=("$@")

        break
        ;;

      # Named argument with value assigned using equal sign. For example:
      #
      # - `-a=value`
      # - `--arg=value`
      -*=*)
        named_arguments+=("$1")
        shift
        ;;

      # Named argument (and optionally a value assigned without an equal sign).
      # For example:
      # - `-a`
      # - `--arg`
      # - `-a value`
      # - `--arg value`
      -*)
        named_arguments+=("$1")
        shift

        if [[ $# -gt 0 && ! "$1" =~ ^- ]]; then
          named_arguments+=("$1")
          shift
        fi
        ;;

      # Positional arguments
      *)
        positional_arguments+=("$1")
        shift
        ;;
    esac
  done
}

# This script allows end-to-end tests to be referenced without `e2e/tests` to
# save typing. This function resolves the paths to end-to-end tests.
get_test_paths() {
  local -n _test_paths=$1
  shift 1

  for argument in "$@"; do
    local maybe_test_path="$test_root_directory/$argument"
    local maybe_test_file="$maybe_test_path.yaml"

    if test -d "$maybe_test_path"; then
      _test_paths+=("$maybe_test_path")
    elif test -f "$maybe_test_path"; then
      _test_paths+=("$maybe_test_path")
    elif test -f "$maybe_test_file"; then
      _test_paths+=("$maybe_test_file")
    else
      >&2 echo "End-to-end tests not found in $maybe_test_path or $maybe_test_file"
    fi
  done
}

options=()
maybe_paths=()
test_paths=()

group_arguments options maybe_paths "$@"

if (( ${#maybe_paths[@]} )); then
  get_test_paths test_paths "${maybe_paths[@]}"
else
  test_paths=("$test_root_directory")
fi

echo "Running end-to-end tests in:"
printf -- "- %s\n" "${test_paths[@]}"

concurrently_args=(
  # Start the fixture server
  "bun ./e2e/fixtures/server.ts"

  # Run the end-to-end tests
  "MAESTRO_USE_GRAALJS=true maestro test -e appId=${app_id} ${options[*]} ${test_paths[*]}"

  # Kill all commands if one dies
  #
  # Shuts down the fixture server once the end-to-end tests finish or ends the
  # end-to-end tests if the fixture server exits for some reason (e.g. a crash).
  --kill-others

  # Command outputs will be logged as-is (no extra processing)
  #
  # Allows individual commands to print their logs as they like.
  --raw

  # Determine the success of the run based on the first command to exit
  #
  # Usually this will be the status of the end-to-end tests as they exit after
  # all tests have run. The fixture server should only exit after the end-to-end
  # tests have finished running.
  --success=first
)

concurrently "${concurrently_args[@]}"
