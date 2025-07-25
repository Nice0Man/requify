// Comment entity types
export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  entityType: "requirement" | "project" | "release" | "test-case";
  entityId: string;
  createdAt: string;
  updatedAt: string;
  isEdited?: boolean;
  parentId?: string; // для вложенных комментариев
  replies?: Comment[];
  likesCount?: number;
  isLiked?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export interface CreateCommentRequest {
  content: string;
  entityType: Comment["entityType"];
  entityId: string;
  parentId?: string;
}

// Дополнительные типы для UI компонентов

/**
 * Тип сущности для комментариев
 */
export type CommentEntityType =
  | "requirement"
  | "project"
  | "release"
  | "test-case"
  | "user";

/**
 * Автор комментария
 */
export interface CommentAuthor {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  isOnline?: boolean;
}

/**
 * Вложенный комментарий
 */
export interface CommentReply extends Omit<Comment, "replies"> {
  parentId: string;
}

/**
 * Комментарий с расширенной информацией
 */
export interface CommentWithDetails extends Comment {
  author: CommentAuthor;
  entity?: {
    id: string;
    title: string;
    type: CommentEntityType;
  };
  replies: CommentReply[];
  attachments?: CommentAttachment[];
  mentions?: CommentMention[];
  metadata?: CommentMetadata;
}

/**
 * Вложение к комментарию
 */
export interface CommentAttachment {
  id: string;
  name: string;
  url: string;
  type: "image" | "file" | "link";
  size?: number;
  mimeType?: string;
}

/**
 * Упоминание в комментарии
 */
export interface CommentMention {
  id: string;
  userId: string;
  userName: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Фильтры для комментариев
 */
export interface CommentFilters {
  search?: string;
  authorId?: string;
  entityType?: CommentEntityType[];
  entityId?: string;
  dateRange?: {
    from: string;
    to: string;
  };
  hasReplies?: boolean;
  hasAttachments?: boolean;
  onlyMentioned?: boolean;
}

/**
 * Режим отображения комментариев
 */
export enum CommentViewMode {
  THREAD = "thread", // Древовидный режим
  FLAT = "flat", // Плоский список
  COMPACT = "compact", // Компактный режим
}

/**
 * Порядок сортировки комментариев
 */
export enum CommentSortOrder {
  NEWEST_FIRST = "newest_first",
  OLDEST_FIRST = "oldest_first",
  MOST_LIKED = "most_liked",
  MOST_REPLIES = "most_replies",
}

/**
 * Статистика комментариев
 */
export interface CommentStats {
  total: number;
  byAuthor: Record<string, number>;
  byEntityType: Record<CommentEntityType, number>;
  byDate: Record<string, number>;
  totalReplies: number;
  totalLikes: number;
  averageRepliesPerComment: number;
}

/**
 * DTO типы для API
 */
export interface CommentDTO {
  id: string;
  content: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
  updated_at: string;
  is_edited?: boolean;
  parent_id?: string;
  likes_count?: number;
  is_liked?: boolean;
  can_edit?: boolean;
  can_delete?: boolean;
}

export interface CommentWithDetailsDTO extends CommentDTO {
  author: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
    is_online?: boolean;
  };
  entity?: {
    id: string;
    title: string;
    type: string;
  };
  replies: CommentDTO[];
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
    size?: number;
    mime_type?: string;
  }[];
  mentions?: {
    id: string;
    user_id: string;
    user_name: string;
    start_index: number;
    end_index: number;
  }[];
}

/**
 * Формы для создания/редактирования
 */
export interface CommentFormData {
  content: string;
  entityType: CommentEntityType;
  entityId: string;
  parentId?: string;
  attachments?: File[];
  mentions?: string[]; // user IDs
}

export interface CommentEditData {
  content: string;
  attachments?: File[];
  mentions?: string[];
}

/**
 * События комментариев
 */
export interface CommentEvent {
  type: "created" | "updated" | "deleted" | "liked" | "replied";
  commentId: string;
  authorId: string;
  timestamp: string;
  data?: Record<string, any>;
}

/**
 * Настройки уведомлений для комментариев
 */
export interface CommentNotificationSettings {
  onReply: boolean;
  onMention: boolean;
  onLike: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

/**
 * Реакции на комментарии
 */
export interface CommentReaction {
  id: string;
  commentId: string;
  userId: string;
  type: "like" | "dislike" | "love" | "laugh" | "angry" | "sad";
  createdAt: string;
}

/**
 * Модерация комментариев
 */
export interface CommentModeration {
  id: string;
  commentId: string;
  moderatorId: string;
  action: "approve" | "reject" | "flag" | "hide";
  reason?: string;
  createdAt: string;
}

/**
 * Метаданные комментария
 */
export interface CommentMetadata {
  editCount: number;
  lastEditAt?: string;
  isResolved?: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
}
