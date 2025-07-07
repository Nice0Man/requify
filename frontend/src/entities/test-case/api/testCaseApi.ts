/**
 * TestCase API - заглушка
 * TODO: Реализовать полноценный API для тест-кейсов
 */

export class TestCaseAPI {
  private static instance: TestCaseAPI;

  private constructor() {}

  public static getInstance(): TestCaseAPI {
    if (!TestCaseAPI.instance) {
      TestCaseAPI.instance = new TestCaseAPI();
    }
    return TestCaseAPI.instance;
  }

  // TODO: Добавить методы для работы с тест-кейсами
}

export const testCaseAPI = TestCaseAPI.getInstance(); 