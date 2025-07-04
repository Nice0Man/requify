import React from 'react';
import { Form, Input, Button, Card } from 'antd';
import { useProjectForm } from '../model';
import type { ProjectFormData } from '../model';

export const ProjectForm: React.FC = () => {
  const { createProject, isLoading } = useProjectForm();
  const [form] = Form.useForm();

  const handleSubmit = async (values: ProjectFormData) => {
    try {
      await createProject(values);
      form.resetFields();
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  return (
    <Card title="Create New Project">
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item name="name" label="Project Name" rules={[{ required: true }]}>
          <Input placeholder="Enter project name" />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={4} placeholder="Enter project description" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Create Project
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}; 