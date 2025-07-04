import React from 'react';
import { Card, Typography, Space, Avatar } from 'antd';
import { MessageOutlined, UserOutlined } from '@ant-design/icons';
import type { Comment } from '../model/types';
import { formatCommentDate, getCommentAuthorInitials } from '../model/types';

const { Text } = Typography;

interface CommentCardProps {
  comment: Comment;
  size?: 'small' | 'default' | 'large';
  onClick?: (comment: Comment) => void;
  className?: string;
}

export const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  size = 'default',
  onClick,
  className,
}) => {
  return (
    <Card
      size={size}
      hoverable={!!onClick}
      onClick={() => onClick?.(comment)}
      className={className}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar 
            size="small" 
            icon={<UserOutlined />}
            style={{ backgroundColor: '#1890ff' }}
          >
            {getCommentAuthorInitials(comment as any)}
          </Avatar>
          <div>
            <Text strong style={{ fontSize: '12px' }}>
              {comment.author_name}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: '11px' }}>
              {formatCommentDate(comment.created_at)}
            </Text>
          </div>
          <MessageOutlined style={{ color: '#999', marginLeft: 'auto' }} />
        </div>

        <Text style={{ fontSize: '13px' }}>{comment.content}</Text>

        {comment.is_internal && (
          <Text type="secondary" style={{ fontSize: '11px', fontStyle: 'italic' }}>
            Внутренний комментарий
          </Text>
        )}
      </Space>
    </Card>
  );
}; 