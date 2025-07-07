// Comment entity types

import type { Comment, CommentWithAuthor } from "@/shared/api/user.api";

// =============================================================================
// Extended UI Types (не в API, только для UI)
// =============================================================================

export interface CommentWithDetails extends CommentWithAuthor {
  requirement_title?: string;
  project_name?: string;
  replies?: Comment[];
  reply_count?: number;
  is_edited?: boolean;
  edit_history?: Array<{
    id: number;
    content: string;
    edited_at: string;
    edited_by: number;
  }>;
  attachments?: Array<{
    id: number;
    filename: string;
    url: string;
    size: number;
    type: string;
  }>;
  mentions?: Array<{
    user_id: number;
    username: string;
    position: number;
  }>;
  tags?: string[];
}

export interface CommentThread {
  id: string;
  root_comment: CommentWithDetails;
  replies: CommentWithDetails[];
  total_replies: number;
  last_activity: string;
  participants: Array<{
    user_id: number;
    username: string;
    full_name: string;
    avatar?: string;
  }>;
}

// =============================================================================
// UI State Types
// =============================================================================

export interface CommentState {
  comments: Comment[];
  currentComment: Comment | null;
  threads: CommentThread[];
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  per_page: number;
}

export interface CommentFilters {
  search?: string;
  requirement_id?: number;
  project_id?: number;
  author_id?: number;
  created_from?: string;
  created_to?: string;
  updated_from?: string;
  updated_to?: string;
  has_replies?: boolean;
  with_attachments?: boolean;
  tags?: string[];
}

// =============================================================================
// Comment Actions (UI specific)
// =============================================================================

export interface CommentAction {
  type: "like" | "dislike" | "reply" | "edit" | "delete" | "report" | "resolve";
  timestamp: string;
  user_id: number;
  comment_id: number;
  data?: Record<string, any>;
}

export interface CommentReaction {
  id: number;
  comment_id: number;
  user_id: number;
  reaction_type: "like" | "dislike" | "love" | "laugh" | "angry" | "sad";
  created_at: string;
}

export interface CommentNotification {
  id: number;
  type: "new_comment" | "reply" | "mention" | "reaction";
  comment_id: number;
  user_id: number;
  triggered_by: number;
  read: boolean;
  created_at: string;
  data?: Record<string, any>;
}

// =============================================================================
// Comment Formatting and Rich Text (UI specific)
// =============================================================================

export interface CommentFormat {
  bold?: Array<{ start: number; end: number }>;
  italic?: Array<{ start: number; end: number }>;
  underline?: Array<{ start: number; end: number }>;
  code?: Array<{ start: number; end: number }>;
  links?: Array<{ start: number; end: number; url: string }>;
  mentions?: Array<{ start: number; end: number; user_id: number }>;
  quotes?: Array<{ start: number; end: number; comment_id?: number }>;
}

export interface CommentDraft {
  id: string;
  requirement_id?: number;
  parent_id?: number;
  content: string;
  format?: CommentFormat;
  attachments?: File[];
  auto_save_at: string;
  expires_at: string;
}

// =============================================================================
// UI Helper Functions
// =============================================================================

export const formatCommentDate = (date: string): string => {
  const commentDate = new Date(date);
  const now = new Date();
  const diffTime = now.getTime() - commentDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  if (diffDays > 7) {
    return commentDate.toLocaleDateString("ru-RU");
  } else if (diffDays > 0) {
    return `${diffDays} дн. назад`;
  } else if (diffHours > 0) {
    return `${diffHours} ч. назад`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} мин. назад`;
  } else {
    return "Только что";
  }
};

export const getCommentAuthorInitials = (
  comment: CommentWithAuthor
): string => {
  const firstName = comment.author_first_name?.charAt(0).toUpperCase() || "";
  const lastName = comment.author_last_name?.charAt(0).toUpperCase() || "";

  if (firstName && lastName) {
    return firstName + lastName;
  }

  if (firstName) return firstName;
  if (lastName) return lastName;

  return comment.author_username?.charAt(0).toUpperCase() || "U";
};

export const getCommentAuthorFullName = (
  comment: CommentWithAuthor
): string => {
  if (comment.author_first_name && comment.author_last_name) {
    return `${comment.author_first_name} ${comment.author_last_name}`;
  }
  return (
    comment.author_first_name ||
    comment.author_last_name ||
    comment.author_username ||
    "Неизвестный пользователь"
  );
};

export const parseCommentMentions = (
  content: string
): Array<{ username: string; position: number }> => {
  const mentionRegex = /@(\w+)/g;
  const mentions: Array<{ username: string; position: number }> = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push({
      username: match[1],
      position: match.index,
    });
  }

  return mentions;
};

export const renderCommentContent = (
  content: string,
  format?: CommentFormat
): string => {
  if (!format) return content;

  let rendered = content;

  // Apply formatting in reverse order to maintain positions
  const allFormats = [
    ...(format.bold || []).map((f) => ({ ...f, type: "bold" })),
    ...(format.italic || []).map((f) => ({ ...f, type: "italic" })),
    ...(format.underline || []).map((f) => ({ ...f, type: "underline" })),
    ...(format.code || []).map((f) => ({ ...f, type: "code" })),
    ...(format.links || []).map((f) => ({ ...f, type: "link" })),
    ...(format.mentions || []).map((f) => ({ ...f, type: "mention" })),
    ...(format.quotes || []).map((f) => ({ ...f, type: "quote" })),
  ].sort((a, b) => b.start - a.start);

  for (const fmt of allFormats) {
    const before = rendered.substring(0, fmt.start);
    const text = rendered.substring(fmt.start, fmt.end);
    const after = rendered.substring(fmt.end);

    switch (fmt.type) {
      case "bold":
        rendered = before + `<strong>${text}</strong>` + after;
        break;
      case "italic":
        rendered = before + `<em>${text}</em>` + after;
        break;
      case "underline":
        rendered = before + `<u>${text}</u>` + after;
        break;
      case "code":
        rendered = before + `<code>${text}</code>` + after;
        break;
      case "link":
        rendered =
          before +
          `<a href="${(fmt as any).url}" target="_blank">${text}</a>` +
          after;
        break;
      case "mention":
        rendered =
          before +
          `<span class="mention" data-user-id="${
            (fmt as any).user_id
          }">${text}</span>` +
          after;
        break;
      case "quote":
        rendered = before + `<blockquote>${text}</blockquote>` + after;
        break;
    }
  }

  return rendered;
};

export const isCommentEditable = (
  comment: Comment,
  currentUserId: number
): boolean => {
  // Комментарий можно редактировать в течение 15 минут после создания
  // или если пользователь является автором и прошло не более 24 часов
  const created = new Date(comment.created_at);
  const now = new Date();
  const diffMinutes = (now.getTime() - created.getTime()) / (1000 * 60);
  const diffHours = diffMinutes / 60;

  if (comment.user_id !== currentUserId) return false;
  if (diffMinutes <= 15) return true;
  if (diffHours <= 24) return true;

  return false;
};

export const getCommentWordCount = (content: string): number => {
  return content
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
};

export const getCommentReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const wordCount = getCommentWordCount(content);
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
};
