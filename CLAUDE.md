# Paper - Markdown to PDF tool

## Dev preferences

- Use `uv venv .venv` for Python virtual environments — always in the project directory, never external paths like /tmp
- Never delete test `.md` files created during development — user verifies outputs manually. Only clean up generated output files (PDFs).
- Rebuild Docker image (`docker build -t paper:latest .`) after template/config changes before testing
