#!/usr/bin/env bash
token_lists=$(find src/tokens/ -type f -printf "%f\n" | sed 's/-.*//')
for f in $token_lists; do
  ./scripts/build.sh "$f"
done