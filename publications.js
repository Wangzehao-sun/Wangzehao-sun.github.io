const bibtexParser = typeof window === 'undefined'
  ? require('./vendor/bibtexParse.js')
  : window.bibtexParse;

function cleanBibValue(value) {
  return String(value ?? '').replace(/[{}]/g, '').trim();
}

function parsePublications(bibtex) {
  return bibtexParser.toJSON(bibtex)
    .filter((entry) => entry.entryTags)
    .map((entry) => {
      const fields = Object.fromEntries(
        Object.entries(entry.entryTags).map(([key, value]) => [key.toLowerCase(), value])
      );
      return {
        title: cleanBibValue(fields.title).replace(/\.$/, ''),
        authors: cleanBibValue(fields.author).split(/\s+and\s+/i).filter(Boolean),
        venue: cleanBibValue(fields.booktitle || fields.journal || fields.venue),
        year: cleanBibValue(fields.year),
        note: cleanBibValue(fields.note),
        paper: String(fields.paper || fields.pdf || fields.url || '').trim(),
        code: String(fields.code || '').trim(),
      };
    })
    .filter((entry) => entry.title);
}

function resolvePublicationLink(value, baseURL) {
  const raw = value.trim();
  if (!/^https?:\/\//i.test(raw) && !/^(?:\.\/|\.\.\/|\/)/.test(raw)) return null;
  try {
    const url = new URL(raw, baseURL);
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function renderPublication(entry, baseURL) {
  const article = document.createElement('article');
  article.className = 'publication';
  const citation = document.createElement('p');
  citation.className = 'publication-citation';

  if (entry.venue) {
    const badge = document.createElement('span');
    badge.className = 'publication-badge';
    badge.setAttribute('aria-hidden', 'true');
    badge.textContent = entry.venue;
    citation.append(badge, ' ');
  }

  entry.authors.forEach((author, index) => {
    if (index) citation.append(', ');
    if (author.toLowerCase() === 'zehao wang') {
      const name = document.createElement('strong');
      name.className = 'publication-owner';
      name.textContent = author;
      citation.append(name);
    } else {
      citation.append(author);
    }
  });
  if (entry.authors.length) citation.append('. ');

  citation.append(`"${entry.title}."`);
  const venueAndYear = [entry.venue, entry.year, entry.note].filter(Boolean).join(' ');
  if (venueAndYear) citation.append(` ${venueAndYear}.`);

  for (const kind of ['paper', 'code']) {
    citation.append(' ');
    const href = resolvePublicationLink(entry[kind], baseURL);
    const label = `[${kind}]`;
    const link = document.createElement(href ? 'a' : 'span');
    link.className = href ? 'publication-link' : 'publication-link-pending';
    link.textContent = label;
    if (href) {
      link.href = href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', `${kind} for ${entry.title}`);
    } else {
      link.title = `Add ${kind} to publications.bib`;
    }
    citation.append(link);
  }

  article.append(citation);
  return article;
}

async function loadPublications() {
  const list = document.getElementById('publication-list');
  try {
    const response = await fetch('publications.bib');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const entries = parsePublications(await response.text());
    if (!entries.length) throw new Error('No publications found');
    const fragment = document.createDocumentFragment();
    entries.forEach((entry) => fragment.append(renderPublication(entry, document.baseURI)));
    list.replaceChildren(fragment);
  } catch (error) {
    const status = document.createElement('p');
    status.className = 'publication-status';
    status.textContent = 'Publications are temporarily unavailable.';
    list.replaceChildren(status);
    console.error('Could not load publications.bib:', error);
  }
}

if (typeof document !== 'undefined') loadPublications();
if (typeof module !== 'undefined') module.exports = { parsePublications, resolvePublicationLink };
