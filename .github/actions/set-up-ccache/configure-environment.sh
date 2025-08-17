#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

# React Native will use its own [ccache config][1] if one isn't defined. This
# [config][2] doesn't set a cache directory, so the [default][3] will be used.
# The default is different from the directory the ccache GitHub Action [sets][4]
# so when the GitHub Action attempts to save the ccache cache into the GitHub
# Actions cache, there is nothing to save.
#
# Configuring a cache directory ensures ccache and the GitHub Action both use
# the same location. Configuring a config path ensures React Native does not
# override our own configs.
#
# [1]: https://github.com/facebook/react-native/blob/288f6d9f483760e05607721890e6ebe8df0b3979/packages/react-native/scripts/xcode/ccache-clang.sh#L10-L12
# [2]: https://github.com/facebook/react-native/blob/288f6d9f483760e05607721890e6ebe8df0b3979/packages/react-native/scripts/xcode/ccache.conf
# [3]: https://ccache.dev/manual/latest.html#config_cache_dir
# [4]: https://github.com/hendrikmuhs/ccache-action/blob/4f314b2aaa5118b9e49eb811277df5b0906bce93/src/common.ts#L67-L75
cache_directory=$GITHUB_WORKSPACE/.ccache
config_path=$GITHUB_WORKSPACE/.config/ccache.conf

# ccache, by default, uses a hash of the compiler's name, size and modification
# time as part of the cache key, see [documentation][1]. However, this may cause
# cache misses in Android builds because Expo defines a specific Android NDK
# version which may be installed from scratch, causing the compiler to have a
# fresh modification time. Hashing the compiler content instead increases the
# stability of the hash.
#
# [1]: https://ccache.dev/manual/latest.html#_common_hashed_information
compiler_check=content

{
  echo "CCACHE_COMPILERCHECK=$compiler_check"
  echo "CCACHE_CONFIGPATH=$config_path"
  echo "CCACHE_DIR=$cache_directory"

  if [ "${depend_mode:-}" = "true" ]; then
    echo "CCACHE_DEPEND=1"
  elif [ "${depend_mode:-}" = "false" ]; then
    echo "CCACHE_NODEPEND=1"
  fi

  if [ "${file_clone:-}" = "true" ]; then
    echo "CCACHE_FILECLONE=1"
  elif [ "${file_clone:-}" = "false" ]; then
    echo "CCACHE_NOFILECLONE=1"
  fi

  if [ "${inode_cache:-}" = "true" ]; then
    echo "CCACHE_INODECACHE=1"
  elif [ "${inode_cache:-}" = "false" ]; then
    echo "CCACHE_NOINODECACHE=1"
  fi

  if [ -n "$sloppiness" ]; then
    echo "CCACHE_SLOPPINESS=$sloppiness"
  fi
} >> "$GITHUB_ENV"