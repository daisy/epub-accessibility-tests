#!/bin/bash
source .env
if [ -z "$1" ]
  then
    echo "Error: No epub directory supplied"
    exit 1
fi

epubdir=$1

java -jar $EPUBCHECK --mode exp --save ${epubdir}
wait
version=`cat ${epubdir}/EPUB/package.opf | xpath -e '//meta[@property="schema:version"]/text()' 2>/dev/null`
title=`cat ${epubdir}/EPUB/package.opf | xpath -e '//dc:title/text()' 2>/dev/null`
title=${title// /-}
title=${title//:/}
cd ./content
NEWEPUBFILE=`ls *.epub`
EPUBFILENAME=${title}-v${version}.epub
mv ${NEWEPUBFILE} ../build/${EPUBFILENAME}
echo Built $EPUBFILENAME
cd ../
