#!/bin/sh

scripts=$(dirname $0)
root=$(readlink -f $scripts/..)

pushd $root > /dev/null

ts-node src/cli.ts "$@"

popd > /dev/null