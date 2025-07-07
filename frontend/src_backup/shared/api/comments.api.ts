import { apiClient, ApiResponse } from "@/shared/api/client";
import type {
  Comment,
  CommentWithAuthor,
  CommentCreate,
  CommentUpdate,
  CommentCreateForRequirement,
  PaginatedResponse,
} from "@/shared/types/api";

export interface CommentListParams {
  skip?: number;
  limit?: number;
  author_id?: number;
}

export interface CommentListResponse {
  items: Comment[];
  total: number;
}

export class CommentsApi {
  constructor(private client = apiClient) {}

  // Get comments for a requirement
  async getRequirementComments(
    requirementId: number,
    params?: CommentListParams
  ): Promise<ApiResponse<CommentWithAuthor[]>> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append("skip", params.skip.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.author_id)
      queryParams.append("author_id", params.author_id.toString());

    const queryString = queryParams.toString();
    const url = queryString
      ? `/comments/requirements/${requirementId}/comments?${queryString}`
      : `/comments/requirements/${requirementId}/comments`;

    return this.client.get<CommentWithAuthor[]>(url);
  }

  // Create comment for a requirement
  async createRequirementComment(
    requirementId: number,
    data: CommentCreateForRequirement
  ): Promise<ApiResponse<Comment>> {
    return this.client.post<Comment>(
      `/comments/requirements/${requirementId}/comments`,
      data
    );
  }

  // Update requirement comment
  async updateRequirementComment(
    _requirementId: number,
    commentId: number,
    data: CommentUpdate
  ): Promise<ApiResponse<Comment>> {
    return this.client.put<Comment>(
      `/comments/${commentId}`,
      data
    );
  }

  // Delete requirement comment
  async deleteRequirementComment(
    _requirementId: number,
    commentId: number
  ): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(
      `/comments/${commentId}`
    );
  }

  // Get comments for a project
  async getProjectComments(
    projectId: number,
    params?: CommentListParams
  ): Promise<ApiResponse<CommentListResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append("skip", params.skip.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.author_id)
      queryParams.append("author_id", params.author_id.toString());

    const queryString = queryParams.toString();
    const url = queryString
      ? `/projects/${projectId}/comments?${queryString}`
      : `/projects/${projectId}/comments`;

    return this.client.get<CommentListResponse>(url);
  }

  // Create comment for a project
  async createProjectComment(
    projectId: number,
    data: CommentCreate
  ): Promise<ApiResponse<Comment>> {
    return this.client.post<Comment>(`/projects/${projectId}/comments`, data);
  }

  // Update project comment
  async updateProjectComment(
    projectId: number,
    commentId: number,
    data: CommentUpdate
  ): Promise<ApiResponse<Comment>> {
    return this.client.put<Comment>(
      `/projects/${projectId}/comments/${commentId}`,
      data
    );
  }

  // Delete project comment
  async deleteProjectComment(
    projectId: number,
    commentId: number
  ): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(
      `/projects/${projectId}/comments/${commentId}`
    );
  }

  // Get comments for a test case
  async getTestCaseComments(
    testCaseId: number,
    params?: CommentListParams
  ): Promise<ApiResponse<CommentListResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append("skip", params.skip.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.author_id)
      queryParams.append("author_id", params.author_id.toString());

    const queryString = queryParams.toString();
    const url = queryString
      ? `/test-cases/${testCaseId}/comments?${queryString}`
      : `/test-cases/${testCaseId}/comments`;

    return this.client.get<CommentListResponse>(url);
  }

  // Create comment for a test case
  async createTestCaseComment(
    testCaseId: number,
    data: CommentCreate
  ): Promise<ApiResponse<Comment>> {
    return this.client.post<Comment>(
      `/test-cases/${testCaseId}/comments`,
      data
    );
  }

  // Update test case comment
  async updateTestCaseComment(
    testCaseId: number,
    commentId: number,
    data: CommentUpdate
  ): Promise<ApiResponse<Comment>> {
    return this.client.put<Comment>(
      `/test-cases/${testCaseId}/comments/${commentId}`,
      data
    );
  }

  // Delete test case comment
  async deleteTestCaseComment(
    testCaseId: number,
    commentId: number
  ): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(
      `/test-cases/${testCaseId}/comments/${commentId}`
    );
  }

  // Get comments for a release
  async getReleaseComments(
    releaseId: number,
    params?: CommentListParams
  ): Promise<ApiResponse<CommentListResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append("skip", params.skip.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.author_id)
      queryParams.append("author_id", params.author_id.toString());

    const queryString = queryParams.toString();
    const url = queryString
      ? `/releases/${releaseId}/comments?${queryString}`
      : `/releases/${releaseId}/comments`;

    return this.client.get<CommentListResponse>(url);
  }

  // Create comment for a release
  async createReleaseComment(
    releaseId: number,
    data: CommentCreate
  ): Promise<ApiResponse<Comment>> {
    return this.client.post<Comment>(`/releases/${releaseId}/comments`, data);
  }

  // Update release comment
  async updateReleaseComment(
    releaseId: number,
    commentId: number,
    data: CommentUpdate
  ): Promise<ApiResponse<Comment>> {
    return this.client.put<Comment>(
      `/releases/${releaseId}/comments/${commentId}`,
      data
    );
  }

  // Delete release comment
  async deleteReleaseComment(
    releaseId: number,
    commentId: number
  ): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(
      `/releases/${releaseId}/comments/${commentId}`
    );
  }

  // Get comments for a specification
  async getSpecComments(
    specId: number,
    params?: CommentListParams
  ): Promise<ApiResponse<CommentListResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append("skip", params.skip.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.author_id)
      queryParams.append("author_id", params.author_id.toString());

    const queryString = queryParams.toString();
    const url = queryString
      ? `/specs/${specId}/comments?${queryString}`
      : `/specs/${specId}/comments`;

    return this.client.get<CommentListResponse>(url);
  }

  // Create comment for a specification
  async createSpecComment(
    specId: number,
    data: CommentCreate
  ): Promise<ApiResponse<Comment>> {
    return this.client.post<Comment>(`/specs/${specId}/comments`, data);
  }

  // Update specification comment
  async updateSpecComment(
    specId: number,
    commentId: number,
    data: CommentUpdate
  ): Promise<ApiResponse<Comment>> {
    return this.client.put<Comment>(
      `/specs/${specId}/comments/${commentId}`,
      data
    );
  }

  // Delete specification comment
  async deleteSpecComment(
    specId: number,
    commentId: number
  ): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(
      `/specs/${specId}/comments/${commentId}`
    );
  }

  // Generic comment operations
  async getComment(commentId: number): Promise<ApiResponse<Comment>> {
    return this.client.get<Comment>(`/comments/${commentId}`);
  }

  async updateComment(
    commentId: number,
    data: CommentUpdate
  ): Promise<ApiResponse<Comment>> {
    return this.client.put<Comment>(`/comments/${commentId}`, data);
  }

  async deleteComment(
    commentId: number
  ): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(`/comments/${commentId}`);
  }

  // Get all comments by author
  async getCommentsByAuthor(
    authorId: number
  ): Promise<ApiResponse<CommentListResponse>> {
    return this.client.get<CommentListResponse>(
      `/comments/by-author/${authorId}`
    );
  }

  // Search comments
  async searchComments(
    query: string
  ): Promise<ApiResponse<CommentListResponse>> {
    const queryParams = new URLSearchParams();
    queryParams.append("q", query);

    return this.client.get<CommentListResponse>(
      `/comments/search?${queryParams.toString()}`
    );
  }

  // Get comment statistics
  async getCommentStats(): Promise<
    ApiResponse<{
      total_comments: number;
      comments_today: number;
      top_authors: Array<{ author_name: string; comment_count: number }>;
    }>
  > {
    return this.client.get<{
      total_comments: number;
      comments_today: number;
      top_authors: Array<{ author_name: string; comment_count: number }>;
    }>("/comments/stats");
  }

  // Bulk operations
  async bulkDeleteComments(
    commentIds: number[]
  ): Promise<ApiResponse<{ deleted_count: number }>> {
    return this.client.delete<{ deleted_count: number }>("/comments/bulk", {
      data: { comment_ids: commentIds },
    });
  }

  // Get comment thread (replies and mentions)
  async getCommentThread(commentId: number): Promise<
    ApiResponse<{
      comment: Comment;
      replies: Comment[];
      mentions: Comment[];
    }>
  > {
    return this.client.get<{
      comment: Comment;
      replies: Comment[];
      mentions: Comment[];
    }>(`/comments/${commentId}/thread`);
  }

  // Get recent comments for dashboard
  async getRecentComments(
    limit: number = 10
  ): Promise<ApiResponse<CommentListResponse>> {
    return this.client.get<CommentListResponse>(
      `/comments/recent?limit=${limit}`
    );
  }
}

export const commentsApi = new CommentsApi();
