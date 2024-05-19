#!/bin/bash
for dir in ./content/*/
do
    echo Processing $dir   
    dir=${dir%*/}
    ./build-one.sh ${dir}
    echo 
    echo
done
