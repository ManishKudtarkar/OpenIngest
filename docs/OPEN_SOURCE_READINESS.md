# OpenIngest Open Source Readiness

This document tracks the maturity steps that make OpenIngest easier to adopt.

## 1. Installable Package

OpenIngest is now packaged with pyproject metadata.

Install locally:

```bash
pip install -e .
```

Install with development tools:

```bash
pip install -e .[dev]
```

Install with web dashboard dependencies:

```bash
pip install -e .[web]
```

CLI command after install:

```bash
openingest --help
```

## 2. CLI Commands

```bash
openingest run
openingest validate
openingest quality
openingest report
openingest history --limit 20
openingest dashboard
```

## 3. Web Dashboard Starter

A Streamlit app is available at apps/streamlit_dashboard.py.

Run it with:

```bash
streamlit run apps/streamlit_dashboard.py
```

## 4. Tests

Run tests with:

```bash
pytest
```

## 5. Continuous Integration

GitHub Actions workflow is in .github/workflows/ci.yml.
It installs the package with dev dependencies and executes pytest on push and pull request.

## Next Steps

1. Expand tests to cover incremental loading and observability SQL paths.
2. Add linting and formatting checks in CI.
3. Add release workflow for publishing to PyPI.
4. Add screenshots and full getting-started docs.
