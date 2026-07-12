"""
Schema utility helpers — thin wrappers around core/validation.py.

Kept for backwards compatibility. New code should import directly from
core.validation.
"""

from core.validation import compare_schema  # noqa: F401

__all__ = ["compare_schema"]
