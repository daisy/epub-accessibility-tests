/*

download all EPUB assets from epub-accessibility-tests releases
for each one, parse the OPF to gather data
list the latest books only in an OPDS feed 
*/

import dotenv from 'dotenv';
import { request } from "@octokit/request";
import fs from 'fs-extra';
import xmldom from 'xmldom';
import xpath from 'xpath';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import unzipper from 'unzipper';
import semver from 'semver';
import {imageDimensionsFromStream} from 'image-dimensions';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config()

const DOMParser = xmldom.DOMParser;
const TMP = '/tmp';

async function main() {
    if (!fs.existsSync('.env')) {
        console.error("ERROR: settings missing, please make a .env file based on the included example.env");
        return;
    }
    let tmp = __dirname + TMP;
    // if redownloading, clear everything from the local tmp folder
    if (process.env.DOWNLOAD == "true") {
        await fs.remove(tmp);
        await fs.ensureDir(tmp);
    }
    // authenticated requests have higher rate limits, that's the only reason to do it
    const requestWithAuth = request.defaults({
        headers: {
            authorization: `token ${process.env.AUTH_TOKEN}`,
        },
    });
    const releases = await requestWithAuth(`GET /repos/${process.env.ORG}/${process.env.REPO}/releases`, {});
    
    let epubs = [];
    // download the asset, put in tmp
    for (let release of releases.data) {
        for (let asset of release.assets) {
            let localFile = tmp + '/' + asset.name; 
            // download the EPUB asset
            if (process.env.DOWNLOAD == "true") {        
                let res = await fetch(asset.browser_download_url);
                let data = await res.blob();
                const buffer = Buffer.from( await data.arrayBuffer() );
                await fs.writeFile(localFile, buffer);
            }

            // unzip and parse the EPUB
            const zip = fs.createReadStream(localFile).pipe(unzipper.Parse({forceStream: true}));
            for await (const entry of zip) {
                const fileName = entry.path;
                // take a shortcut and just grab the OPF, these files are predictable so we can skip parsing container.xml
                if (fileName.indexOf('.opf') != -1) {
                    let content = (await entry.buffer()).utf8Slice();
                    let opfData = await parseOpf(content);
                    opfData.repoTag = release.tag_name;
                    opfData.href = asset.browser_download_url;
                    epubs.push(opfData);
                } 
                else {
                    entry.autodrain();
                }
            }
        }
    }
    // just look at english versions
    epubs = epubs.filter(epub => epub.language == "en");

    // find the latest version per topic
    let topics = Array.from(new Set(epubs.map(epub => epub.topic)));
    let latestEpubs = [];
    for (let topic of topics) {
        let latestVersion = epubs.filter(epub => epub.topic == topic)
            .sort((a, b) => a.version && semver.gt(a.version, b.version) ? -1 : 1)[0];
        latestEpubs.push(latestVersion);
    }
    
    // get the cover image dimensions
    await Promise.all(
        latestEpubs.map(async data => {
            let epubFolder = findEpubFolder(data.title);
            // make the cover image url e.g. 
            // https://raw.githubusercontent.com/daisy/epub-accessibility-tests/main/content/epub30-test-0340/EPUB/Images/cover.jpg
            if (data.coverImage.href) {
                let coverImageRemoteUrl = 
                    `https://raw.githubusercontent.com/${process.env.ORG}/${process.env.REPO}/${data.repoTag}/${epubFolder}/${data.coverImage.href}`;
                let res = await fetch(coverImageRemoteUrl);
                let size = await imageDimensionsFromStream(res.body);
                data.coverImage.height = size.height;
                data.coverImage.width = size.width;
                data.coverImage.href = coverImageRemoteUrl;
            }
            else {
                data.coverImage = null;
            }
        })
    );

    let publications = latestEpubs.map(epub => {
        let publicationEntry = {
            metadata: {
                "@type": "http://schema.org/Book",
                identifier: epub.identifier,
                title: epub.title,
                author: epub.author,            
                description: epub.description,
                collection: epub.topic,
                modified: epub.modified,
                publisher: epub.publisher ?? process.env.DEFAULT_PUBLISHER,
                subject: [
                    `${process.env.SUBJECT} ${epub.language}`
                ]
            },
            links: [{
                type: "application/epub+zip",
                rel: "http://opds-spec.org/acquisition/open-access",
                href: epub.href
            }],
            images: []
        };
        if (epub.coverImage) {
            publicationEntry.images.push(epub.coverImage);
        }
        return publicationEntry;
    });

    let opds = {
        metadata: {
            title: process.env.TITLE
        },
        links: [{
            href: process.env.OPDS_LINK,
            type: "application/opds+json",
            rel: "self"
        }],
        publications
    };
    fs.writeFileSync(tmp + '/' + 'opds.json', JSON.stringify(opds, null, '  '));
    console.log("Wrote " + tmp + '/' + 'opds.json');
}

// based on some magic words, say which folder this book is in in the repo
// this info could almost be derived from the publication ID 
// which is generally com.github.epub-testsuite.epub30-test-0304-2.0.0
//  but sometimes it's not :( 
function findEpubFolder(title) {
    let lookup = 
    {        
        "basic functionality": "content/epub30-test-0301/EPUB",
        "non-visual reading": "content/epub30-test-0302/EPUB",
        "visual adjustments": "content/epub30-test-0303/EPUB",
        "read aloud": "content/epub30-test-0304/EPUB",
        "media overlays": "content/epub30-test-0320/EPUB",
        "extended descriptions": "content/epub30-test-0350/EPUB",
        "math": "content/epub30-test-0360/EPUB"
    };
    let idx = Object.keys(lookup).find(key => title.toLowerCase().trim().indexOf(key) != -1);
    return lookup[idx] ?? null;
}

/*
extract this stuff from the EPUB package document

identifier: dc:identifier[uid],
title: dc:title,
author: dc:creator,
description: dc:description,
collection: dc:subject,
modified: meta[dcterms:modified],
publisher: dc:publisher,
language: dc:language,
topic: dc:subject
version: meta[schema:version]
coverImage: {
    href: item[cover-image]/@href
    type: item[cover-image]/@media-type
}
*/
function parseOpf(content) {
    const select = xpath.useNamespaces({ 
        opf: 'http://www.idpf.org/2007/opf',
        dc: 'http://purl.org/dc/elements/1.1/'
    });
    let errorHandler = {
        warning: w => console.warn(w),
        error: e => console.error(e),
        fatalError: fe => console.error(fe)
    };
    const doc = new DOMParser({errorHandler}).parseFromString(content);
    let result = {};
    let uidid = select('//opf:package/@unique-identifier', doc)[0]?.textContent;
    result.identifier = select(`//dc:identifier[@id="${uidid}"]`, doc)[0]?.textContent;
    result.title = select(`//dc:title`, doc)[0]?.textContent;
    result.author = select(`//dc:creator`, doc)[0]?.textContent;
    result.description = select(`//dc:description`, doc)[0]?.textContent;
    result.collection = select(`//dc:subject`, doc)[0]?.textContent;
    result.modified = select(`//opf:meta[@property="dcterms:modified"]`, doc)[0]?.textContent;
    result.publisher = select(`//dc:publisher`, doc)[0]?.textContent;
    result.language = select(`//dc:language`, doc)[0]?.textContent;
    result.topic = select(`//dc:subject`, doc)[0]?.textContent;
    result.version = select(`//opf:meta[@property="schema:version"]`, doc)[0]?.textContent;
    result.coverImage = {
        href: select(`//opf:item[@properties="cover-image"]/@href`, doc)[0]?.nodeValue,
        type: select(`//opf:item[@properties="cover-image"]/@media-type`, doc)[0]?.nodeValue
    };
    return result;
}

(async () => {
    await main();
})();
