# Zehao Wang

Personal academic homepage hosted with GitHub Pages.

## Update publications

Edit `publications.bib`. Entries appear in file order; author names are separated with `and`. Add full HTTPS URLs to the `paper` and `code` fields to enable those links. Empty fields remain non-clickable.

## Preview locally

```sh
python3 -m http.server 8765
```

Open <http://127.0.0.1:8765/>. The page loads `publications.bib` over HTTP, so opening `index.html` directly as a file will not load the publications list.

Run `node --test tests/publications.test.js` to check BibTeX parsing and link handling.
