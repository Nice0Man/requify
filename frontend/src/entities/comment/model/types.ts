// Comment entity types
export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  entityType: 'requirement' | 'project' | 'release' | 'test-case';
  entityId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  content: string;
  entityType: Comment['entityType'];
  entityId: string;
} 