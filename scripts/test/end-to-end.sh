#!/bin/bash

app_id=co.hibi.app.test
test_root_directory="e2e/tests"

maybe_test_path="$test_root_directory${1:+/$1}"
maybe_test_file="${maybe_test_path}.yaml"

if test -d "${maybe_test_path}"; then
  test_path=$maybe_test_path
elif test -f "${maybe_test_path}"; then
  test_path=$maybe_test_path
elif test -f "${maybe_test_file}"; then
  test_path="${maybe_test_file}"
else
  >&2 echo "End-to-end tests not found in ${maybe_test_path} or ${maybe_test_file}"
  exit 1
fi

echo "Running end-to-end tests in ${test_path}"

concurrently_args=(
  # Start the fixture server
  "bun ./e2e/fixtures/server.ts"

  # Run the end-to-end tests
  "MAESTRO_USE_GRAALJS=true maestro test -e appId=${app_id} ${test_path}"

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
