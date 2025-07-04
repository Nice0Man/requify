import React from 'react';
import { Card, List } from 'antd';
import { useProjectManagement } from '../model';
import { ProjectCard } from '@/entities/project';
import type { Project } from '@/entities/project';

export const ProjectList: React.FC = () => {
  const { projects, isLoading } = useProjectManagement();

  return (
    <Card title="Projects" loading={isLoading}>
      <List
        grid={{ gutter: 16, column: 2 }}
        dataSource={projects}
        renderItem={(project: Project) => (
          <List.Item>
            <ProjectCard 
              project={project as any}
              showProgress={false}
              showStats={false}
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export const ProjectDetails: React.FC = () => <div>Project Details</div>;
export const ProjectSettings: React.FC = () => <div>Project Settings</div>;