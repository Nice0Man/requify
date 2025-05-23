"""
Точка входа для выполнения скриптов как модуля.

Использование:
    python -m scripts.migrations --help
"""

import sys
from pathlib import Path

# Добавляем корневую директорию в path
sys.path.insert(0, str(Path(__file__).parent.parent))

from scripts.migrations import main

if __name__ == "__main__":
    main()
