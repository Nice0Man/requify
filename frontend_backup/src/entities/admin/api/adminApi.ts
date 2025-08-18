/**
 * Admin API - заглушка
 * TODO: Реализовать полноценный API для админ-панели
 */

export class AdminAPI {
  private static instance: AdminAPI;

  private constructor() {}

  public static getInstance(): AdminAPI {
    if (!AdminAPI.instance) {
      AdminAPI.instance = new AdminAPI();
    }
    return AdminAPI.instance;
  }

  // TODO: Добавить методы для работы с админ-панелью
}

export const adminAPI = AdminAPI.getInstance(); 