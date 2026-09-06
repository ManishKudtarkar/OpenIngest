# Contributing to OpenIngest

Thank you for considering a contribution. All contributions — bug reports, feature requests, docs improvements, and code — are welcome.

---

## Quick start

```bash
git clone https://github.com/ManishKudtarkar/OpenIngest.git
cd OpenIngest
pip install -e ".[devel]"
```

---

## Development workflow

1. **Fork** the repository and clone your fork
2. Create a branch: `git checkout -b feat/my-feature` or `fix/issue-description`
3. Make your changes
4. Run the checks locally (see below)
5. Commit with a clear message
6. Open a pull request against `main`

---

## Running checks locally

```bash
# Lint
ruff check .

# Type check
mypy core/ utils/ models/ scripts/ openingest/ --ignore-missing-imports

# Tests with coverage
pytest --cov=core --cov=utils --cov-report=term-missing
```

All three must pass before a PR can merge.

---

## Adding a connector

1. Create `core/connectors/<category>/<name>_connector.py`
2. Subclass `BaseConnector` from `core/connectors/base.py`
3. Implement `read(self) -> pd.DataFrame`
4. Register it in `core/connectors/registry.py` inside `_auto_register_builtins()`
5. Add the extra to `pyproject.toml` if it needs a new dependency
6. Document it in `docs/CONNECTORS.md`
7. Add a test in `tests/test_connectors_local.py` or `tests/test_connectors_registry.py`

---

## Code style

- Python 3.10+ type hints on all public functions
- Ruff for lint (`E`, `F`, `I`, `B`, `UP` rule sets)
- Mypy strict for `core/` and `utils/`
- No bare `except:` — use `except Exception` with `# noqa: BLE001` and a comment

---

## Reporting bugs

Open an issue at https://github.com/ManishKudtarkar/OpenIngest/issues and include:
- OpenIngest version (`openingest version`)
- Python version (`python --version`)
- OS
- Minimal reproduction: the datasets.yaml block and the error traceback
