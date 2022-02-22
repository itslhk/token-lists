#!/usr/bin/env bash
echo $1
node src/write.js "$1" > "build/tradescrow-${1,,}.tokenlist.json"