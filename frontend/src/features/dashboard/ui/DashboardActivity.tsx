import React from 'react';
import { Card, List, Avatar } from 'antd';
import { useDashboard } from '../model';

export const DashboardActivity: React.FC = () => {
  const { activity, isLoading } = useDashboard();

  return (
    <Card title="Recent Activity" loading={isLoading}>
      <List
        itemLayout="horizontal"
        dataSource={activity.slice(0, 10)}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar src={item.user_avatar}>{item.user_name[0]}</Avatar>}
              title={item.title}
              description={item.description}
            />
            <div>{new Date(item.created_at).toLocaleDateString()}</div>
          </List.Item>
        )}
      />
    </Card>
  );
}; 