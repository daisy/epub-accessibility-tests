#!/bin/bash
for dir in ./content/*/
do
    dir=${dir%*/}
    ./build-one.sh ${dir}
done
