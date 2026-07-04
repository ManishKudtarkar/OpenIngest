import subprocess
import sys


VERSION = "2.0.0"
PACKAGE = "openingest"


def run_version() -> int:
    print(f"\n  OpenIngest v{VERSION}")
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
