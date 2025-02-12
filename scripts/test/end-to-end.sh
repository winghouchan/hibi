#!/bin/bash

TEST_DIR="e2e/tests${1:+/$1}"

echo "Running end-to-end tests in ${TEST_DIR}"

CONCURRENTLY_ARGS=(
  # Start the fixture server
  "bun ./e2e/fixtures/server.ts"

  # Run the end-to-end tests
  "MAESTRO_USE_GRAALJS=true maestro test -e appId=co.hibi.app.test ${TEST_DIR}"

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
