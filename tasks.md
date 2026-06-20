# Tasks

## 1. Fix PDF colors (template.tex)
- [x] Mount `config/` dir in docker run so template edits take effect without rebuild
- [x] Code blocks: dark background (`#1A1A18`) with light text (`#E0DDD6`)
- [x] Links: red (`#C8102E`) for all link types — always on, no front matter flag needed
- [x] Blockquotes: red left bar, gray italic text via `mdframed`

## 2. Fix editor preview title rendering
- [x] Parse YAML front matter (title, author, date)
- [x] Render centered title block matching LaTeX `\begin{center}` layout
- [x] Strip front matter from body before passing to marked.js
- [x] Remove hyphen/em-dash prefix from author name

## 3. Editor preview polish
- [x] Code blocks: use CMU Typewriter / monospace font with more padding
- [x] Links: add underline

## 4. Editor preview hr
- [x] Make `<hr>` full width (no default browser margins)

## 5. Editor preview h2
- [x] Remove horizontal line/border-bottom after `##` headings

## 6. PDF styling (template.tex)
- [x] Code blocks: add padding (border radius not achievable without tcolorbox conflict — deferred)
- [x] Horizontal rule (`---`): make full width
- [x] Blockquote: red left bar via `framed` package, gray italic text
- [x] Links: red color always on

## 7. Preview/PDF parity
- [x] Code block border radius in PDF (blocked by tcolorbox/mdframed conflict)
- [ ] Audit all styled elements to confirm preview and PDF match

## 8. PDF title block
- [x] Render title from frontmatter (remove `--title=yes` flag)
- [x] Render author from frontmatter
- [x] Remove hyphen prefix from author line
- [ ] Render date from frontmatter
- [ ] Fix code block padding — bottom padding uneven

