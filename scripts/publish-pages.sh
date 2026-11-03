#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
npm run build
# Use the existing platform HTTPS Git configuration; never print or copy credentials.
repo_origin=$(git remote get-url origin)
release_dir=$(mktemp -d /tmp/shiguang-pages.XXXXXX)
trap 'rm -rf "$release_dir"' EXIT
git init -q "$release_dir"
git -C "$release_dir" remote add origin "$repo_origin"
if git ls-remote --exit-code --heads origin gh-pages >/dev/null 2>&1; then
  git -C "$release_dir" fetch -q origin gh-pages
  git -C "$release_dir" checkout -q -b gh-pages FETCH_HEAD
else
  git -C "$release_dir" checkout -q --orphan gh-pages
fi
# This directory is created by this command and contains generated release files only.
find "$release_dir" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -R dist/. "$release_dir/"
git -C "$release_dir" add .
if ! git -C "$release_dir" diff --cached --quiet; then
  git -C "$release_dir" -c user.name="Store Demo Publisher" -c user.email="demo-publisher@users.noreply.github.com" commit -q -m "Publish Malaysia Chinese store H5 demo"
  git -C "$release_dir" push origin HEAD:gh-pages
fi
