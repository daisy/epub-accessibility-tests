epub-accessibility-tests
========================

EPUB Content containing accessibility tests for reading systems

## To build EPUBs:

Run `run.sh` to run epubcheck and build EPUB files. The output appears in the `build` directory, named after the EPUB title plus the version number.

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
- a language, e.g
```<dc:language>fr</dc:language>```
- a version, in the form of MAJ.MIN.PATCH, e.g.
```<meta property="schema:version">1.0.0</meta>```

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
