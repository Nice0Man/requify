"""
Интеграционный тест для рефакторенных сервисов.

Проверяет корректность работы новой архитектуры сервисов.
"""

import asyncio
from typing import Dict, Any
from datetime import date, timedelta

from app.utils.logger import logger
from .base import ServiceFactory, event_dispatcher, service_config
from .auth_service import AuthenticationService
from .user_profile_service import UserProfileService
from .user_registration_service import UserRegistrationService
from .admin_service import AdminService
from .company_management_service import CompanyManagementService
from .test_case_service import TestCaseManagementService
from .analytics_service import AnalyticsService


class ServiceIntegrationTester:
    """Тестер интеграции сервисов."""

    def __init__(self):
        self.test_results: Dict[str, Any] = {}
        self.passed_tests = 0
        self.failed_tests = 0

    def log_test_result(self, test_name: str, success: bool, message: str = ""):
        """Логирование результата теста."""
        self.test_results[test_name] = {"success": success, "message": message}

        if success:
            self.passed_tests += 1
            logger.info(f"✅ {test_name}: PASSED - {message}")
        else:
            self.failed_tests += 1
            logger.error(f"❌ {test_name}: FAILED - {message}")

    def test_singleton_pattern(self):
        """Тест паттерна Singleton."""
        try:
            # Проверяем, что сервисы являются синглтонами
            auth1 = AuthenticationService()
            auth2 = AuthenticationService()

            if auth1 is auth2:
                self.log_test_result(
                    "singleton_pattern",
                    True,
                    "Services are properly implemented as singletons",
                )
            else:
                self.log_test_result(
                    "singleton_pattern", False, "Services are not singletons"
                )

        except Exception as e:
            self.log_test_result("singleton_pattern", False, f"Exception: {str(e)}")

    def test_service_factory(self):
        """Тест фабрики сервисов."""
        try:
            # Проверяем работу фабрики
            registered_services = ServiceFactory.list_services()

            if len(registered_services) > 0:
                self.log_test_result(
                    "service_factory",
                    True,
                    f"Factory has {len(registered_services)} registered services",
                )
            else:
                self.log_test_result(
                    "service_factory", False, "No services registered in factory"
                )

            # Проверяем получение сервиса
            try:
                auth_service = ServiceFactory.get_service("authentication")
                if isinstance(auth_service, AuthenticationService):
                    self.log_test_result(
                        "service_factory_get",
                        True,
                        "Successfully retrieved service from factory",
                    )
                else:
                    self.log_test_result(
                        "service_factory_get",
                        False,
                        "Retrieved service is not of expected type",
                    )
            except Exception:
                self.log_test_result(
                    "service_factory_get",
                    False,
                    "Failed to retrieve service from factory",
                )

        except Exception as e:
            self.log_test_result("service_factory", False, f"Exception: {str(e)}")

    def test_service_initialization(self):
        """Тест инициализации сервисов."""
        services_to_test = [
            ("AuthenticationService", AuthenticationService),
            ("UserProfileService", UserProfileService),
            ("UserRegistrationService", UserRegistrationService),
            ("AdminService", AdminService),
            ("CompanyManagementService", CompanyManagementService),
            ("TestCaseManagementService", TestCaseManagementService),
            ("AnalyticsService", AnalyticsService),
        ]

        for service_name, service_class in services_to_test:
            try:
                service_instance = service_class()

                # Проверяем, что сервис имеет правильное имя
                if hasattr(service_instance, "get_service_name"):
                    name = service_instance.get_service_name()
                    self.log_test_result(
                        f"init_{service_name.lower()}",
                        True,
                        f"Service initialized with name: {name}",
                    )
                else:
                    self.log_test_result(
                        f"init_{service_name.lower()}",
                        False,
                        "Service missing get_service_name method",
                    )

            except Exception as e:
                self.log_test_result(
                    f"init_{service_name.lower()}",
                    False,
                    f"Failed to initialize: {str(e)}",
                )

    async def test_event_dispatcher(self):
        """Тест диспетчера событий."""
        try:
            test_event_data = None

            async def test_listener(data):
                nonlocal test_event_data
                test_event_data = data

            # Подписка на событие
            event_dispatcher.subscribe("test.event", test_listener)

            # Отправка события
            test_data = {"test": "value"}
            await event_dispatcher.dispatch("test.event", test_data)

            # Небольшая задержка для обработки события
            await asyncio.sleep(0.1)

            if test_event_data == test_data:
                self.log_test_result(
                    "event_dispatcher", True, "Event dispatcher works correctly"
                )
            else:
                self.log_test_result(
                    "event_dispatcher", False, "Event not properly dispatched"
                )

            # Отписка от события
            event_dispatcher.unsubscribe("test.event", test_listener)

        except Exception as e:
            self.log_test_result("event_dispatcher", False, f"Exception: {str(e)}")

    def test_service_configuration(self):
        """Тест системы конфигурации."""
        try:
            # Установка конфигурации
            test_config = {"test_setting": "test_value", "number_setting": 42}
            service_config.set_config("test_service", test_config)

            # Получение конфигурации
            retrieved_config = service_config.get_config("test_service")

            if retrieved_config == test_config:
                self.log_test_result(
                    "service_configuration",
                    True,
                    "Configuration system works correctly",
                )
            else:
                self.log_test_result(
                    "service_configuration",
                    False,
                    "Configuration not properly stored/retrieved",
                )

            # Тест получения отдельной настройки
            setting_value = service_config.get_setting("test_service", "test_setting")
            default_value = service_config.get_setting(
                "test_service", "nonexistent", "default"
            )

            if setting_value == "test_value" and default_value == "default":
                self.log_test_result(
                    "service_configuration_get",
                    True,
                    "Individual settings retrieval works",
                )
            else:
                self.log_test_result(
                    "service_configuration_get",
                    False,
                    "Individual settings retrieval failed",
                )

        except Exception as e:
            self.log_test_result("service_configuration", False, f"Exception: {str(e)}")

    def test_error_handling(self):
        """Тест обработки ошибок."""
        try:
            auth_service = AuthenticationService()

            # Проверяем, что сервис имеет методы обработки ошибок
            if hasattr(auth_service, "_handle_error"):
                self.log_test_result(
                    "error_handling", True, "Services have error handling capabilities"
                )
            else:
                self.log_test_result(
                    "error_handling", False, "Services missing error handling methods"
                )

        except Exception as e:
            self.log_test_result("error_handling", False, f"Exception: {str(e)}")

    def test_logging_functionality(self):
        """Тест функциональности логирования."""
        try:
            auth_service = AuthenticationService()

            # Проверяем, что сервис имеет методы логирования
            if hasattr(auth_service, "_log_operation"):
                auth_service._log_operation("test_operation", {"test": "data"})
                self.log_test_result(
                    "logging_functionality", True, "Services have logging capabilities"
                )
            else:
                self.log_test_result(
                    "logging_functionality", False, "Services missing logging methods"
                )

        except Exception as e:
            self.log_test_result("logging_functionality", False, f"Exception: {str(e)}")

    def test_analytics_service_metrics(self):
        """Тест калькуляторов метрик аналитического сервиса."""
        try:
            analytics_service = AnalyticsService()

            # Проверяем, что метрики зарегистрированы
            if hasattr(analytics_service, "_metric_calculators"):
                calculators = analytics_service._metric_calculators
                if len(calculators) > 0:
                    self.log_test_result(
                        "analytics_metrics",
                        True,
                        f"Analytics service has {len(calculators)} metric calculators",
                    )
                else:
                    self.log_test_result(
                        "analytics_metrics", False, "No metric calculators registered"
                    )
            else:
                self.log_test_result(
                    "analytics_metrics",
                    False,
                    "Analytics service missing metric calculators",
                )

        except Exception as e:
            self.log_test_result("analytics_metrics", False, f"Exception: {str(e)}")

    async def run_all_tests(self):
        """Запуск всех тестов."""
        logger.info("🚀 Starting service integration tests...")

        # Синхронные тесты
        self.test_singleton_pattern()
        self.test_service_factory()
        self.test_service_initialization()
        self.test_service_configuration()
        self.test_error_handling()
        self.test_logging_functionality()
        self.test_analytics_service_metrics()

        # Асинхронные тесты
        await self.test_event_dispatcher()

        # Результаты
        total_tests = self.passed_tests + self.failed_tests
        success_rate = (self.passed_tests / total_tests * 100) if total_tests > 0 else 0

        logger.info(f"\n📊 Integration Test Results:")
        logger.info(f"✅ Passed: {self.passed_tests}")
        logger.info(f"❌ Failed: {self.failed_tests}")
        logger.info(f"📈 Success Rate: {success_rate:.1f}%")

        if self.failed_tests == 0:
            logger.info(
                "🎉 All integration tests passed! The refactored services are working correctly."
            )
        else:
            logger.warning(
                f"⚠️  {self.failed_tests} tests failed. Check the logs for details."
            )

        return self.test_results


async def run_integration_tests():
    """Запуск интеграционных тестов."""
    tester = ServiceIntegrationTester()
    return await tester.run_all_tests()


if __name__ == "__main__":
    # Запуск тестов при прямом вызове
    results = asyncio.run(run_integration_tests())
    print(f"\nTest completed. Results: {results}")
