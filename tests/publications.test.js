const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { parsePublications, resolvePublicationLink } = require('../publications.js');

test('reads the current BibTeX file without assuming its publication details', () => {
  const entries = parsePublications(fs.readFileSync('publications.bib', 'utf8'));
  assert.ok(entries.length > 0);
  for (const entry of entries) {
    assert.ok(entry.title);
    assert.ok(Array.isArray(entry.authors));
    assert.equal(typeof entry.paper, 'string');
    assert.equal(typeof entry.code, 'string');
  }
});

test('accepts filled author and link fields without changing the page markup', () => {
  const [entry] = parsePublications('@article{demo, title={Example}, author={A Person and Zehao Wang}, year={2026}, paper={https://example.org/paper}, code={https://github.com/example/repo}}');
  assert.deepEqual(entry.authors, ['A Person', 'Zehao Wang']);
  assert.equal(resolvePublicationLink(entry.paper, 'https://example.org/'), 'https://example.org/paper');
  assert.equal(resolvePublicationLink(entry.code, 'https://example.org/'), 'https://github.com/example/repo');
});

test('keeps missing or unsafe links inactive', () => {
  const base = 'https://example.org/site/';
  assert.equal(resolvePublicationLink('', base), null);
  assert.equal(resolvePublicationLink('javascript:alert(1)', base), null);
  assert.equal(resolvePublicationLink('data:text/html,hello', base), null);
  assert.equal(resolvePublicationLink('./files/paper.pdf', base), 'https://example.org/site/files/paper.pdf');
});
