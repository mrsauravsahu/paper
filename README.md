---
Author: Sahu <mrsauravsahu@outloook.com>
continuous-pages: true
no-page-numbers: true
---

# paper

A Markdown-to-PDF tool built on [pandoc](https://pandoc.org/), with support for emoji, Mermaid diagrams, and a custom LaTeX template.

## Overview

`paper` takes a Markdown file and renders it as a styled PDF via a Docker container. It handles:

- Custom LaTeX template with section-aware headers and page numbers
- Emoji rendering (unicode → SVG via twemoji)
- Mermaid diagrams (rendered via headless Chrome)
- Toggles for page numbers and section page breaks

## Requirements

- Docker
- The `paper:latest` image built from this directory

```sh
docker build -t paper:latest .
```

## Usage

```sh
paper <file.md> [options]
```

| Option | Description |
|---|---|
| `--pages=yes` | Show page numbers (default) |
| `--pages=no` | Hide page numbers |
| `--continuous` | No page break between sections |
| `-v`, `--verbose` | Print commands as they run |

After the PDF is generated it opens automatically. You are then prompted whether to keep or delete it.

### Examples

```sh
# Basic
paper report.md

# No page numbers
paper report.md --pages=no

# No section breaks, no page numbers
paper report.md --continuous --pages=no
```

## Mermaid diagrams

Mermaid code blocks are rendered as diagrams in the PDF.

````markdown
```mermaid
graph TD
    A[Write Markdown] --> B[Run paper]
    B --> C{Success?}
    C -- Yes --> D[Open PDF]
    C -- No --> E[Fix errors]
    E --> B
```
````

```mermaid
sequenceDiagram
    participant Author
    participant paper
    participant pandoc
    participant LaTeX

    Author->>paper: paper report.md
    paper->>pandoc: pandoc report.md --template ...
    pandoc->>LaTeX: compiled .tex
    LaTeX-->>Author: report.pdf
```

## Front matter variables

Set these in your document's YAML front matter to control layout:

```yaml
---
title: My Report
author: Your Name
date: 2026-06-13
continuous-pages: true   # no page breaks between sections
no-page-numbers: true    # hide page numbers
---
```

## Project structure

```
paper/
├── Dockerfile               # pandoc + Chrome + node environment
├── template.tex             # custom LaTeX template
├── emoji_filter.js          # pandoc filter: unicode emoji → SVG
├── pandoc-emoji-filter.js   # preprocessor: prepares emoji for filter
├── paper                    # CLI script (symlinked from dotfiles/scripts/paper)
└── package.json             # node dependencies (mermaid-filter, pandoc-filter)
```
