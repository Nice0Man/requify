// Comment types for entities layer
export interface Comment {
  id: number;
  content: string;
  user_id: number;
  author_name: string;
  author_email?: string;
  entity_type: string;
  entity_id: number;
  created_at: string;
  updated_at: string;
  is_internal?: boolean;
  edited?: boolean;
}

export interface CommentCreate {
  content: string;
  entity_type: string;
  entity_id: number;
  is_internal?: boolean;
}

export interface CommentUpdate {
  content?: string;
  is_internal?: boolean;
} 