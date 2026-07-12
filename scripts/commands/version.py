import subprocess
import sys

from openingest import __version__

PACKAGE = "openingest"


def run_version() -> int:
    print(f"\n  OpenIngest v{__version__}")
    print(f"  Python {sys.version.split()[0]}")
    print(f"  {sys.executable}\n")
    return 0


def run_upgrade() -> int:
    print(f"\n  Upgrading {PACKAGE}...\n")
    result = subprocess.run(
        [sys.executable, "-m", "pip", "install", "--upgrade", PACKAGE],
        check=False,
    )
    return result.returncode
