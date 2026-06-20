# Paper Project — Claude Guidelines

## Task tracking
- When the user says "add to tasks", write to `tasks.md` in the project root.
- Do NOT use Claude task tools (TaskCreate, TaskUpdate, TaskList, etc.).

## Project conventions
- The `paper` CLI script builds PDFs via Docker using `config/template.tex` as the Pandoc template.
- All example documents live in `examples/` — this is the base dir for the editor.
- The editor server (`editor/server.js`) saves and loads files from `examples/`.
