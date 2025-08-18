/**
 * Comment API - заглушка
 * TODO: Реализовать полноценный API для комментариев
 */

export class CommentAPI {
  private static instance: CommentAPI;

  private constructor() {}

  public static getInstance(): CommentAPI {
    if (!CommentAPI.instance) {
      CommentAPI.instance = new CommentAPI();
    }
    return CommentAPI.instance;
  }

  // TODO: Добавить методы для работы с комментариями
}

export const commentAPI = CommentAPI.getInstance(); 