#!/bin/bash

APP_ID=co.hibi.app.test
E2E_ROOT_DIR="e2e/tests"

MAYBE_TEST_PATH="$E2E_ROOT_DIR${1:+/$1}"
MAYBE_TEST_FILE="${MAYBE_TEST_PATH}.yaml"

if test -d "${MAYBE_TEST_PATH}"; then
  TEST_PATH=$MAYBE_TEST_PATH
elif test -f "${MAYBE_TEST_PATH}"; then
  TEST_PATH=$MAYBE_TEST_PATH
elif test -f "${MAYBE_TEST_FILE}"; then
  TEST_PATH="${MAYBE_TEST_FILE}"
else
  >&2 echo "End-to-end tests not found in ${MAYBE_TEST_PATH} or ${MAYBE_TEST_FILE}"
  exit 1
fi

echo "Running end-to-end tests in ${TEST_PATH}"

CONCURRENTLY_ARGS=(
  # Start the fixture server
  "bun ./e2e/fixtures/server.ts"

  # Run the end-to-end tests
  "MAESTRO_USE_GRAALJS=true maestro test -e appId=${APP_ID} ${TEST_PATH}"

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

concurrently "${CONCURRENTLY_ARGS[@]}"
