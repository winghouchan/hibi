#!/usr/bin/env bash
set -e 

BASELINE_BRANCH=${GITHUB_BASE_REF:="main"}

# Required for `git switch` on CI
git fetch origin

# Gather baseline perf measurements
git switch "${BASELINE_BRANCH}"

yarn install
yarn run bench --baseline

# Gather current perf measurements & compare results
git switch --detach -

yarn install
yarn run bench --branch
