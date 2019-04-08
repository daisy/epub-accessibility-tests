epub-accessibility-tests
========================

EPUB Content containing accessibility tests for reading systems

## Structural requirements for these books

### In the package document:

- a topic, from a pre-determined set of keywords
  - basic-functionality
  - non-visual-reading
  - read-aloud
  - visual-adjustments
  - media-overlays
  - extended-descriptions
  - math

- the topic goes in `dc:subject`, e.g.
```<dc:subject>media-overlays</dc:subject>```

- a language, e.g
```<dc:language>fr</dc:language>```

- a version, in the form of MAJ.MIN.PATCH, e.g.
```<meta property="schema:version">1.0.0</meta>```

### In the navigation document

All tests must have an entry in the navigation document.

### In the content document

Each test must be formatted exactly as:

```
<section id="TEST-ID" class="ftest">
  <h2><span class="test-id">TEST-ID</span> <span class="test-title">TEST TITLE</span></h2>
  <p class="desc">TEST DESCRIPTION</p>
  <p class="eval">EVALUATION INSTRUCTIONS</p>
</section>
```

For example:

```
<section id="file-010" class="ftest">
  <h2><span class="test-id">file-010</span> <span class="test-title">Operating system/Platform accessibility:</span></h2>
  <p class="desc">If you are using a hardware device, it can be started independently and essential accessibility for starting and exiting applications is available.</p>
  <p class="eval">Indicate Pass or Fail.</p>
</section>
```
