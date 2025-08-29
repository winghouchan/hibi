#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

artifacts_endpoint="/repos/{owner}/{repo}/actions/artifacts"

# Filter for the most relevant artifact, prioritising for artifacts created from
# the same branch, otherwise falling back to the main branch.
filter=".artifacts
  | map(
      select(
        .expired == false and (
          .workflow_run.head_branch == \"${GITHUB_HEAD_REF:-}\" or
          .workflow_run.head_branch == \"${GITHUB_REF_NAME:-}\" or
          .workflow_run.head_branch == \"main\"
        )
      )
    )
  | sort_by(
      (
        .worfklow_run.head_branch |
        if . == \"${GITHUB_HEAD_REF:-}\" then 0
        elif . == \"${GITHUB_REF_NAME:-}\" then 1
        else 3 end
      )
    )
  | .[0].workflow_run.id"

android_artifact_workflow_run_id=$(gh api \
  "${artifacts_endpoint}" \
  --method GET \
  --header 'Accept: application/vnd.github+json' \
  --field "name=build-android" \
  --jq "${filter}")

ios_artifact_workflow_run_id=$(gh api \
  "${artifacts_endpoint}" \
  --method GET \
  --header 'Accept: application/vnd.github+json' \
  --field "name=build-ios" \
  --jq "${filter}")

ids="{ \"android\": ${android_artifact_workflow_run_id}, \"ios\": ${ios_artifact_workflow_run_id} }"

echo "ids=${ids}" >> "${GITHUB_OUTPUT}"
