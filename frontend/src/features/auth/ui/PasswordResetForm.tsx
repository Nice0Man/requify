import React from 'react';
import { Form, Input, Button, Typography } from 'antd';
import { useAuth } from '../model';

const { Title } = Typography;

export const PasswordResetForm: React.FC = () => {
  const { requestPasswordReset, isLoading } = useAuth();

  const handleSubmit = async (values: { email: string }) => {
    await requestPasswordReset(values.email);
  };

  return (
    <div>
      <Title level={2}>Reset Password</Title>
      <Form onFinish={handleSubmit}>
        <Form.Item name="email" rules={[{ required: true, type: 'email' }]}>
          <Input placeholder="Enter your email" />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={isLoading} block>
          Send Reset Link
        </Button>
      </Form>
    </div>
  );
}; 