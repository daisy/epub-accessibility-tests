epub-accessibility-tests
========================

EPUB Content containing accessibility tests for reading systems

## Index of materials

* `content/epub30-test-0301/`: Basic Functionality
* `content/epub30-test-0302/`: Non-Visual Reading
* `content/epub30-test-0303/`: Visual Adjustments
* `content/epub30-test-0304/`: Read Aloud
* `content/epub30-test-0320/`: Media Overlays 
* `content/epub30-test-0330/`: Math (longer book, not on site)
* `content/epub30-test-0340/`: Extended Descriptions (longer book, not on site)
* `content/epub30-test-0350/`: Extended Descriptions (basic)
* `content/epub30-test-0360/`: Math (basic)


## Current status

| title | repo version | epubtest.org version | notes |
| ----- | ----------- | --------------------- | ----- |
| Basic Functionality | 1.0.1 | 1.0.0 | [changes](https://github.com/daisy/epub-accessibility-tests/commit/cdea0e9362175418e2fad125c32fe682801c5b95)|
| Non-Visual Reading | 1.0.1 | 1.0.0 | [changes](https://github.com/daisy/epub-accessibility-tests/commit/)|
| Visual Adjustments | 1.0.1 | 1.0.0 | [changes](https://github.com/daisy/epub-accessibility-tests/commit/)|
| Read Aloud | 1.0.1 | 1.0.0 | [changes](https://github.com/daisy/epub-accessibility-tests/commit/)|
| Media Overlays | 1.0.1 | 1.0.0 | changes [1](https://github.com/daisy/epub-accessibility-tests/commit/), [2](https://github.com/daisy/epub-accessibility-tests/commit/f79ace317caeb634263edefa05a0fc6fcaeb1c22)|
| Math | 1.1.1 | 1.1.1 | |
| Extended Descriptions | 1.1.1 | 1.1.1 | |

## To build EPUBs:

Set the location of your [EPUBCheck](https://github.com/w3c/epubcheck) jar, e.g. 
```
export EPUBCHECK=/Users/marisa/Downloads/epubcheck-4.2.0-rc/epubcheck.jar
```

Run `build-all.sh` to run epubcheck and build EPUB files. The output appears in the `build` directory, named after the EPUB title plus the version number.

If you just need to build one book, run `build-one.sh foldername` where `foldername` is the directory containing the EPUB fileset for that book.

Full example (building one book):

```
export EPUBCHECK=/Users/marisa/Downloads/epubcheck-4.2.0-rc/epubcheck.jar; ./build-one.sh ./content/epub30-test-0330
```

## Structural requirements for these books

Use `EPUB`, not `OEPBS`, for the content directory, if you want to use the included build script.

### In the package document:

- a topic, from a pre-determined set of keywords
  - basic-functionality
  - non-visual-reading
  - read-aloud
  - visual-adjustments
  - media-overlays
  - extended-descriptions
  - math
- the title goes in `dc:title`, e.g.
```<dc:title>title</dc:title>```
- the topic goes in `dc:subject`, e.g.
```<dc:subject>media-overlays</dc:subject>```
- a language, e.g ```<dc:language>fr</dc:language>```. Supported languages are:
  - en
  - fr
- a version, in the form of MAJ.MIN.PATCH, e.g.
```<meta property="schema:version">1.0.0</meta>```
- a unique identifier (don't repeat across versions), e.g.
```    <dc:identifier id="uid">com.github.epub-testsuite.epub30-test-0330-1.1.2</dc:identifier>```

### In the navigation document

All tests must have an entry in the navigation document. The entry must be a list item with `class='test'` and it must contain a link, e.g.
```<li class="test"><a href="content.xhtml#test-id">Test Name</a></li>```

If you need to create an entry for something that is not a test, don't include `class='test'` on it, e.g.
```<li><a href="supplement.xhtml">Supplemental Content</a></li>```


### In the content document

Each test must be formatted exactly as:

```
<section id="TEST-ID" class="test">
  <h2><span class="test-id">TEST-ID</span> <span class="test-title">TEST TITLE</span></h2>
  <p class="desc">TEST DESCRIPTION</p>
  <p class="eval">EVALUATION INSTRUCTIONS</p>
</section>
```

For example:

```
<section id="file-010" class="test">
  <h2><span class="test-id">file-010</span> <span class="test-title">Operating system/Platform accessibility:</span></h2>
  <p class="desc">If you are using a hardware device, it can be started independently and essential accessibility for starting and exiting applications is available.</p>
  <p class="eval">Indicate Pass or Fail.</p>
</section>
```

## About versioning

The version number is formatted as MAJ.MIN.PATCH. The rules for how to use each are:

1. MAJ: Implies big changes, so use sparingly. At the moment, changes to MAJ or MIN both result in the epubtest.org ingestion system seeing the version as "new" and will list results for older version numbers as being out of date.

2. MIN: Same effect as MAJ but implies changes of a less drastic nature.

3. PATCH: For non-breaking changes. E.g. a French book that has version 1.2.4 is treated as being as recent as an English book with version 1.2.3. PATCH is useful for when you make a change that doesn't affect testing.
