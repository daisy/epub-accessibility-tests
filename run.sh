#!/bin/bash
EPUBCHECK="/Users/marisa/Downloads/epubcheck-4.2.0-rc/epubcheck.jar"

for dir in ./content/*/
do
    dir=${dir%*/}
    java -jar ${EPUBCHECK} --mode exp --save ./content/${dir##*/}
    wait
    version=`cat ${dir}/EPUB/package.opf | xpath '//meta[@property="schema:version"]/text()' 2>/dev/null`
    title=`cat ${dir}/EPUB/package.opf | xpath '//dc:title[@id="title"]/text()' 2>/dev/null`
    title=${title// /-}
    title=${title//:/}
    cd ./content
    NEWEPUBFILE=`ls *.epub`
    EPUBFILENAME=${title}-v${version}.epub
    mv ${NEWEPUBFILE} ../build/${EPUBFILENAME}
    cd ../
done
