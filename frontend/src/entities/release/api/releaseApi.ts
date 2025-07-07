/**
 * Release API - заглушка
 * TODO: Реализовать полноценный API для релизов
 */

export class ReleaseAPI {
  private static instance: ReleaseAPI;

  private constructor() {}

  public static getInstance(): ReleaseAPI {
    if (!ReleaseAPI.instance) {
      ReleaseAPI.instance = new ReleaseAPI();
    }
    return ReleaseAPI.instance;
  }

  // TODO: Добавить методы для работы с релизами
}

export const releaseAPI = ReleaseAPI.getInstance(); 