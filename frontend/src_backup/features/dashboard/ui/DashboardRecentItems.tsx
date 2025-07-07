import React from 'react';
import { Card, List, Tag } from 'antd';
import { useDashboardProjects, useDashboardRequirements } from '../model';

export const DashboardRecentItems: React.FC = () => {
  const { recentProjects, isLoading: projectsLoading } = useDashboardProjects(5);
  const { recentRequirements, isLoading: requirementsLoading } = useDashboardRequirements(5);

  const isLoading = projectsLoading || requirementsLoading;

  const allItems = [
    ...recentProjects.map(p => ({ ...p, type: 'project' })),
    ...recentRequirements.map(r => ({ ...r, type: 'requirement' }))
  ].slice(0, 10);

  return (
    <Card title="Recent Items" loading={isLoading}>
      <List
        itemLayout="horizontal"
        dataSource={allItems}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              title={item.name || item.title}
              description={item.description}
            />
            <Tag color={item.type === 'project' ? 'blue' : 'green'}>
              {item.type}
            </Tag>
          </List.Item>
        )}
      />
    </Card>
  );
}; 