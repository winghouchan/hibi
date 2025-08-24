#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

bundle_server_output=nohup.out

# Start the JavaScript bundle server in the background
nohup yarn start:test > "${bundle_server_output}" 2>&1 &
server_pid=$!

# Wait for output file to be created
while ! test -f "${bundle_server_output}"; do
  sleep 0.1
done

# Wait for server to be ready
while ! grep -q 'Waiting on' "${bundle_server_output}"; do
  if ! kill -0 "${server_pid}" 2>/dev/null; then
    echo "Server process died" >&2
    exit 1
  fi
  sleep 0.1
done

# Generate a JavaScript bundle. Allows the app to request a bundle from the
# cache instead of generating one from scratch. This minimises the risk of
# test failure due to assertions timing out while waiting for the bundle to
# load. The URL was determined by inspecting the sources via the Dev Tools.
curl 'http://localhost:8081/index.bundle?'\
'platform=android&'\
'dev=true&'\
'lazy=true&'\
'minify=false&'\
'app=co.hibi.app.test&'\
'modulesOnly=false&'\
'runModule=true&'\
'excludeSource=true&'\
'sourcePaths=url-server&'\
'transform.routerRoot=src%2Fapp&'\
'transform.reactCompiler=true&'\
'transform.engine=hermes&'\
'transform.bytecode=1&'\
'unstable_transformProfile=hermes-stable' \
--output /dev/null
