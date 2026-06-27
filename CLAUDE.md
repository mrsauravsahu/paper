# Paper - Markdown to PDF tool

## Dev preferences

- Use `uv venv .venv` for Python virtual environments — always in the project directory, never external paths like /tmp
- Never delete test `.md` files created during development — user verifies outputs manually. Only clean up generated output files (PDFs).
- Rebuild Docker image (`docker build -t paper:latest .`) after template/config changes before testing

## Testing requirement

Every change must include a test:

- **New feature or fix** → add a new `.md` file under `tests/` that exercises the change, and add a corresponding row to `tests/tests.csv`.
- **Improvement to an existing capability** → extend the relevant existing test `.md` file (or add a new row to `tests/tests.csv` if the check differs).

No change to `config/template.tex`, `src/`, or the `paper` script is complete without a matching test entry.

## Running tests

```sh
./tests/run.sh
```

Tests require the Docker image to be built first:

```sh
docker build -t paper:latest .
```
