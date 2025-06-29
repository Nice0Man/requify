import { apiClient, ApiClient, ApiResponse } from "@/shared/api/client";

export interface Comment {
  id: number;
  content: string;
  entity_type: CommentEntityType;
  entity_id: number;
  parent_id?: number;
  author_id: number;
  author_name: string;
  author_email: string;
  is_edited: boolean;
  is_deleted: boolean;
  edit_count: number;
  last_edited_at?: string;
  attachments: string[];
  mentions: number[];
  reactions: CommentReaction[];
  replies_count: number;
  created_at: string;
  updated_at: string;
}

export interface CommentCreate {
  content: string;
  entity_type: CommentEntityType;
  entity_id: number;
  parent_id?: number;
  attachments?: string[];
  mentions?: number[];
}

export interface CommentUpdate {
  content: string;
  attachments?: string[];
  mentions?: number[];
}

export interface CommentListParams {
  skip?: number;
  limit?: number;
  entity_type?: CommentEntityType;
  entity_id?: number;
  author_id?: number;
  parent_id?: number;
  include_deleted?: boolean;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface CommentListResponse {
  items: Comment[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface CommentReaction {
  id: number;
  comment_id: number;
  user_id: number;
  user_name: string;
  reaction_type: ReactionType;
  created_at: string;
}

export interface CommentReactionCreate {
  reaction_type: ReactionType;
}

export interface CommentThread {
  parent_comment: Comment;
  replies: Comment[];
  total_replies: number;
  has_more_replies: boolean;
}

export enum CommentEntityType {
  REQUIREMENT = "requirement",
  PROJECT = "project",
  RELEASE = "release",
  TEST_CASE = "test_case",
  TEST_RESULT = "test_result",
  SPECIFICATION = "specification",
  USER = "user",
}

export enum ReactionType {
  LIKE = "like",
  DISLIKE = "dislike",
  LOVE = "love",
  LAUGH = "laugh",
  CONFUSED = "confused",
  CELEBRATE = "celebrate",
}

export class CommentsApi {
  constructor(private client = apiClient) {}

  // 1. Get Comments
  async getComments(
    params?: CommentListParams
  ): Promise<ApiResponse<CommentListResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append("skip", params.skip.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.entity_type)
      queryParams.append("entity_type", params.entity_type);
    if (params?.entity_id)
      queryParams.append("entity_id", params.entity_id.toString());
    if (params?.author_id)
      queryParams.append("author_id", params.author_id.toString());
    if (params?.parent_id)
      queryParams.append("parent_id", params.parent_id.toString());
    if (params?.include_deleted !== undefined)
      queryParams.append("include_deleted", params.include_deleted.toString());
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);

    const queryString = queryParams.toString();
    const url = queryString ? `/comments/?${queryString}` : "/comments/";

    return this.client.get<CommentListResponse>(url);
  }

  // 2. Create Comment
  async createComment(
    commentData: CommentCreate
  ): Promise<ApiResponse<Comment>> {
    return this.client.post<Comment>("/comments/", commentData);
  }

  // 3. Get Comment
  async getComment(commentId: number): Promise<ApiResponse<Comment>> {
    return this.client.get<Comment>(`/comments/${commentId}`);
  }

  // 4. Update Comment
  async updateComment(
    commentId: number,
    commentData: CommentUpdate
  ): Promise<ApiResponse<Comment>> {
    return this.client.put<Comment>(`/comments/${commentId}`, commentData);
  }

  // 5. Delete Comment
  async deleteComment(
    commentId: number,
    hard_delete: boolean = false
  ): Promise<ApiResponse<{ message: string }>> {
    const queryParams = new URLSearchParams();
    if (hard_delete) queryParams.append("hard_delete", "true");

    const url = queryParams.toString()
      ? `/comments/${commentId}?${queryParams.toString()}`
      : `/comments/${commentId}`;
    return this.client.delete<{ message: string }>(url);
  }

  // 6. Get Comment Replies
  async getCommentReplies(
    commentId: number,
    params?: { skip?: number; limit?: number }
  ): Promise<ApiResponse<CommentListResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append("skip", params.skip.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const queryString = queryParams.toString();
    const url = queryString
      ? `/comments/${commentId}/replies?${queryString}`
      : `/comments/${commentId}/replies`;

    return this.client.get<CommentListResponse>(url);
  }

  // Entity-specific comment methods
  async getEntityComments(
    entityType: CommentEntityType,
    entityId: number,
    params?: Omit<CommentListParams, "entity_type" | "entity_id">
  ): Promise<ApiResponse<CommentListResponse>> {
    return this.getComments({
      ...params,
      entity_type: entityType,
      entity_id: entityId,
    });
  }

  async createEntityComment(
    entityType: CommentEntityType,
    entityId: number,
    commentData: Omit<CommentCreate, "entity_type" | "entity_id">
  ): Promise<ApiResponse<Comment>> {
    return this.createComment({
      ...commentData,
      entity_type: entityType,
      entity_id: entityId,
    });
  }

  // Comment reactions
  async addReaction(
    commentId: number,
    reactionData: CommentReactionCreate
  ): Promise<ApiResponse<CommentReaction>> {
    return this.client.post<CommentReaction>(
      `/comments/${commentId}/reactions`,
      reactionData
    );
  }

  async removeReaction(
    commentId: number,
    reactionType: ReactionType
  ): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(
      `/comments/${commentId}/reactions/${reactionType}`
    );
  }

  async getCommentReactions(
    commentId: number
  ): Promise<ApiResponse<CommentReaction[]>> {
    return this.client.get<CommentReaction[]>(
      `/comments/${commentId}/reactions`
    );
  }

  // Comment threads
  async getCommentThread(
    commentId: number,
    params?: { max_depth?: number; limit?: number }
  ): Promise<ApiResponse<CommentThread>> {
    const queryParams = new URLSearchParams();
    if (params?.max_depth)
      queryParams.append("max_depth", params.max_depth.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const queryString = queryParams.toString();
    const url = queryString
      ? `/comments/${commentId}/thread?${queryString}`
      : `/comments/${commentId}/thread`;

    return this.client.get<CommentThread>(url);
  }

  // Convenience methods for specific entities
  async getRequirementComments(
    requirementId: number,
    params?: Omit<CommentListParams, "entity_type" | "entity_id">
  ): Promise<ApiResponse<CommentListResponse>> {
    return this.getEntityComments(
      CommentEntityType.REQUIREMENT,
      requirementId,
      params
    );
  }

  async createRequirementComment(
    requirementId: number,
    content: string,
    parentId?: number
  ): Promise<ApiResponse<Comment>> {
    return this.createEntityComment(
      CommentEntityType.REQUIREMENT,
      requirementId,
      {
        content,
        parent_id: parentId,
      }
    );
  }

  async getProjectComments(
    projectId: number,
    params?: Omit<CommentListParams, "entity_type" | "entity_id">
  ): Promise<ApiResponse<CommentListResponse>> {
    return this.getEntityComments(CommentEntityType.PROJECT, projectId, params);
  }

  async createProjectComment(
    projectId: number,
    content: string,
    parentId?: number
  ): Promise<ApiResponse<Comment>> {
    return this.createEntityComment(CommentEntityType.PROJECT, projectId, {
      content,
      parent_id: parentId,
    });
  }

  async getReleaseComments(
    releaseId: number,
    params?: Omit<CommentListParams, "entity_type" | "entity_id">
  ): Promise<ApiResponse<CommentListResponse>> {
    return this.getEntityComments(CommentEntityType.RELEASE, releaseId, params);
  }

  async createReleaseComment(
    releaseId: number,
    content: string,
    parentId?: number
  ): Promise<ApiResponse<Comment>> {
    return this.createEntityComment(CommentEntityType.RELEASE, releaseId, {
      content,
      parent_id: parentId,
    });
  }

  async getTestCaseComments(
    testCaseId: number,
    params?: Omit<CommentListParams, "entity_type" | "entity_id">
  ): Promise<ApiResponse<CommentListResponse>> {
    return this.getEntityComments(
      CommentEntityType.TEST_CASE,
      testCaseId,
      params
    );
  }

  async createTestCaseComment(
    testCaseId: number,
    content: string,
    parentId?: number
  ): Promise<ApiResponse<Comment>> {
    return this.createEntityComment(CommentEntityType.TEST_CASE, testCaseId, {
      content,
      parent_id: parentId,
    });
  }

  // Bulk operations
  async bulkDeleteComments(
    commentIds: number[],
    hardDelete: boolean = false
  ): Promise<ApiResponse<{ deleted: number; errors: any[] }>> {
    return this.client.delete<{ deleted: number; errors: any[] }>(
      "/comments/bulk",
      {
        data: { comment_ids: commentIds, hard_delete: hardDelete },
      }
    );
  }

  // Search and filtering
  async searchComments(
    query: string,
    entityType?: CommentEntityType,
    entityId?: number
  ): Promise<ApiResponse<CommentListResponse>> {
    const queryParams = new URLSearchParams({ search: query });
    if (entityType) queryParams.append("entity_type", entityType);
    if (entityId) queryParams.append("entity_id", entityId.toString());

    return this.client.get<CommentListResponse>(
      `/comments/search?${queryParams.toString()}`
    );
  }

  // User's own comments
  async getUserComments(
    userId: number,
    params?: Omit<CommentListParams, "author_id">
  ): Promise<ApiResponse<CommentListResponse>> {
    return this.getComments({
      ...params,
      author_id: userId,
    });
  }

  async getCurrentUserComments(
    params?: Omit<CommentListParams, "author_id">
  ): Promise<ApiResponse<CommentListResponse>> {
    return this.client.get<CommentListResponse>("/comments/me");
  }
}

// Export singleton instance
export const commentsApi = new CommentsApi();
