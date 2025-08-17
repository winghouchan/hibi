#!/usr/bin/env bash

# See: https://github.com/ReactiveCircus/android-emulator-runner/blob/b68ca169d637f9b4902ca0bcd9ff339a105e5518/README.md?plain=1#L13-L23
# Hardware acceleration is available on larger (4-core runners): https://github.blog/changelog/2023-02-23-hardware-accelerated-android-virtualization-on-actions-windows-and-linux-larger-hosted-runners/
# 4-core runners are available for open source repositories:  https://github.blog/news-insights/product-news/github-hosted-runners-double-the-power-for-open-source/

set -o errexit
set -o nounset
set -o pipefail

echo 'KERNEL=="kvm", GROUP="kvm", MODE="0666", OPTIONS+="static_node=kvm"' | sudo tee /etc/udev/rules.d/99-kvm4all.rules
sudo udevadm control --reload-rules
sudo udevadm trigger --name-match=kvm
