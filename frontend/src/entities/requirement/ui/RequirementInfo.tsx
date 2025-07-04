import React from 'react';
import { Descriptions, Typography, Avatar } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { RequirementStatus } from './RequirementStatus';
import { RequirementPriority } from './RequirementPriority';
import type { Requirement } from '../model/types';

const { Text, Title } = Typography;

interface RequirementInfoProps {
  requirement: Requirement;
  layout?: 'horizontal' | 'vertical';
  size?: 'small' | 'middle' | 'default';
  showExtendedInfo?: boolean;
  column?: number;
  className?: string;
}

export const RequirementInfo: React.FC<RequirementInfoProps> = ({
  requirement,
  layout = 'horizontal',
  size = 'default',
  showExtendedInfo = false,
  column = 1,
  className,
}) => {
  const basicItems = [
    {
      key: 'id',
      label: 'ID',
      children: `REQ-${requirement.id}`,
    },
    {
      key: 'title',
      label: 'Название',
      children: requirement.title,
      span: column > 1 ? column : 1,
    },
    {
      key: 'description',
      label: 'Описание',
      children: requirement.description || 'Не указано',
      span: column > 1 ? column : 1,
    },
    {
      key: 'status',
      label: 'Статус',
      children: <RequirementStatus statusId={requirement.status_id} />,
    },
    {
      key: 'priority',
      label: 'Приоритет',
      children: <RequirementPriority priorityId={requirement.priority_id} />,
    },
    {
      key: 'type',
      label: 'Тип',
      children: `Тип ${requirement.type_id}`,
    },
  ];

  const extendedItems = showExtendedInfo ? [
    ...basicItems,
    {
      key: 'project',
      label: 'Проект',
      children: `Проект ${requirement.project_id}`,
    },
    {
      key: 'author',
      label: 'Автор',
      children: `Пользователь ${requirement.author_id}`,
    },
    {
      key: 'lastModified',
      label: 'Изменен',
      children: `Пользователь ${requirement.last_modified_by}`,
    },
    ...(requirement.deadline ? [{
      key: 'deadline',
      label: 'Срок',
      children: new Date(requirement.deadline).toLocaleDateString('ru-RU'),
    }] : []),
    ...(requirement.release_id ? [{
      key: 'release',
      label: 'Релиз',
      children: `Релиз ${requirement.release_id}`,
    }] : []),
    ...(requirement.spec_id ? [{
      key: 'spec',
      label: 'Спецификация',
      children: `Спец ${requirement.spec_id}`,
    }] : []),
    {
      key: 'createdAt',
      label: 'Создано',
      children: new Date(requirement.created_at).toLocaleDateString('ru-RU'),
    },
    {
      key: 'updatedAt',
      label: 'Обновлено',
      children: new Date(requirement.updated_at).toLocaleDateString('ru-RU'),
    },
  ] : basicItems;

  return (
    <div className={className}>
      <div style={{ marginBottom: 16, textAlign: layout === 'vertical' ? 'center' : 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar
            size={layout === 'vertical' ? 'large' : 'default'}
            icon={<FileTextOutlined />}
            style={{ backgroundColor: '#1890ff' }}
          />
          <div>
            <Title level={layout === 'vertical' ? 3 : 4} style={{ margin: 0 }}>
              {requirement.title}
            </Title>
            <Text type="secondary">REQ-{requirement.id}</Text>
          </div>
        </div>
      </div>
      
      <Descriptions
        layout={layout}
        size={size}
        column={column}
        items={extendedItems}
        bordered={layout === 'vertical'}
      />
    </div>
  );
}; 