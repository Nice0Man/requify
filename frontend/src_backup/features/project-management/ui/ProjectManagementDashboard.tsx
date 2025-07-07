import React from 'react';
import { Row, Col, Card } from 'antd';
import { ProjectList } from './ProjectList';
import { ProjectForm } from './ProjectForm';

export const ProjectManagementDashboard: React.FC = () => {
  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={16}>
          <ProjectList />
        </Col>
        <Col span={8}>
          <ProjectForm />
        </Col>
      </Row>
    </div>
  );
}; 