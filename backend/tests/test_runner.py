#!/usr/bin/env python3
"""
Скрипт для запуска различных категорий тестов совместимости.

Предоставляет удобный интерфейс для запуска тестов
с различными конфигурациями и отчетами.
"""

import sys
import subprocess
import argparse
from pathlib import Path
from typing import List, Optional


class TestRunner:
    """Класс для управления запуском тестов."""
    
    def __init__(self, base_dir: Path = None):
        self.base_dir = base_dir or Path(__file__).parent
    
    def run_compatibility_tests(self, verbose: bool = True, coverage: bool = True) -> int:
        """Запускает тесты совместимости моделей и схем."""
        cmd = ["python", "-m", "pytest"]
        
        # Основные файлы тестов
        cmd.extend([
            "test_models_schemas_compatibility.py",
            "test_schema_validation_edge_cases.py"
        ])
        
        # Маркеры
        cmd.extend(["-m", "compatibility or unit"])
        
        # Дополнительные опции
        if verbose:
            cmd.extend(["-v", "-s"])
        
        if coverage:
            cmd.extend([
                "--cov=app.models",
                "--cov=app.schemas", 
                "--cov-report=term-missing",
                "--cov-report=html:htmlcov/compatibility"
            ])
        
        cmd.extend([
            "--tb=short",
            "--color=yes"
        ])
        
        print(f"Запуск тестов совместимости: {' '.join(cmd)}")
        return subprocess.run(cmd, cwd=self.base_dir).returncode
    
    def run_performance_tests(self, verbose: bool = True) -> int:
        """Запускает тесты производительности."""
        cmd = ["python", "-m", "pytest"]
        
        cmd.extend([
            "test_database_performance.py",
            "-m", "performance",
            "-v", "-s",
            "--tb=short",
            "--color=yes",
            "--durations=0"  # Показать время выполнения всех тестов
        ])
        
        print(f"Запуск тестов производительности: {' '.join(cmd)}")
        return subprocess.run(cmd, cwd=self.base_dir).returncode
    
    def run_edge_case_tests(self, verbose: bool = True) -> int:
        """Запускает тесты крайних случаев."""
        cmd = ["python", "-m", "pytest"]
        
        cmd.extend([
            "test_schema_validation_edge_cases.py",
            "-m", "edge_case",
            "-v" if verbose else "",
            "--tb=short",
            "--color=yes"
        ])
        
        # Убираем пустые строки
        cmd = [arg for arg in cmd if arg]
        
        print(f"Запуск тестов крайних случаев: {' '.join(cmd)}")
        return subprocess.run(cmd, cwd=self.base_dir).returncode
    
    def run_all_tests(self, verbose: bool = True, coverage: bool = True) -> int:
        """Запускает все тесты совместимости."""
        cmd = ["python", "-m", "pytest"]
        
        # Все файлы тестов
        cmd.extend([
            "test_models_schemas_compatibility.py",
            "test_schema_validation_edge_cases.py",
            "test_database_performance.py"
        ])
        
        if verbose:
            cmd.extend(["-v", "-s"])
        
        if coverage:
            cmd.extend([
                "--cov=app",
                "--cov-report=term-missing",
                "--cov-report=html:htmlcov/full"
            ])
        
        cmd.extend([
            "--tb=short",
            "--color=yes",
            "--durations=10"
        ])
        
        print(f"Запуск всех тестов: {' '.join(cmd)}")
        return subprocess.run(cmd, cwd=self.base_dir).returncode
    
    def run_fast_tests(self) -> int:
        """Запускает только быстрые тесты для CI/CD."""
        cmd = ["python", "-m", "pytest"]
        
        cmd.extend([
            "test_models_schemas_compatibility.py",
            "test_schema_validation_edge_cases.py",
            "-m", "unit and not slow",
            "--tb=line",
            "--color=yes",
            "--durations=5"
        ])
        
        print(f"Запуск быстрых тестов: {' '.join(cmd)}")
        return subprocess.run(cmd, cwd=self.base_dir).returncode
    
    def generate_report(self, output_dir: str = "test_reports") -> int:
        """Генерирует подробный отчет о тестах."""
        output_path = Path(self.base_dir) / output_dir
        output_path.mkdir(exist_ok=True)
        
        cmd = ["python", "-m", "pytest"]
        
        cmd.extend([
            "test_models_schemas_compatibility.py",
            "test_schema_validation_edge_cases.py",
            "--html=" + str(output_path / "report.html"),
            "--self-contained-html",
            "--cov=app",
            "--cov-report=html:" + str(output_path / "coverage"),
            "--junitxml=" + str(output_path / "junit.xml"),
            "-v"
        ])
        
        print(f"Генерация отчета в {output_path}")
        return subprocess.run(cmd, cwd=self.base_dir).returncode


def main():
    """Главная функция для запуска из командной строки."""
    parser = argparse.ArgumentParser(
        description="Запуск тестов совместимости моделей и схем"
    )
    
    parser.add_argument(
        "test_type",
        choices=[
            "compatibility", "performance", "edge_cases", 
            "all", "fast", "report"
        ],
        help="Тип тестов для запуска"
    )
    
    parser.add_argument(
        "--no-verbose", 
        action="store_true",
        help="Отключить подробный вывод"
    )
    
    parser.add_argument(
        "--no-coverage",
        action="store_true", 
        help="Отключить сбор покрытия кода"
    )
    
    parser.add_argument(
        "--output-dir",
        default="test_reports",
        help="Директория для отчетов (только для --report)"
    )
    
    args = parser.parse_args()
    
    runner = TestRunner()
    verbose = not args.no_verbose
    coverage = not args.no_coverage
    
    if args.test_type == "compatibility":
        return runner.run_compatibility_tests(verbose, coverage)
    elif args.test_type == "performance":
        return runner.run_performance_tests(verbose)
    elif args.test_type == "edge_cases":
        return runner.run_edge_case_tests(verbose)
    elif args.test_type == "all":
        return runner.run_all_tests(verbose, coverage)
    elif args.test_type == "fast":
        return runner.run_fast_tests()
    elif args.test_type == "report":
        return runner.generate_report(args.output_dir)
    else:
        print(f"Неизвестный тип тестов: {args.test_type}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
