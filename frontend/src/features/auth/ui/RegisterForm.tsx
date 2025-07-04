import React from 'react';
import { Form, Input, Button, Typography } from 'antd';
import { useAuth } from '../model';

const { Title } = Typography;

export interface RegisterFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onError,
  className,
}) => {
  const { register, isLoading } = useAuth();

  const handleSubmit = async (values: any) => {
    try {
      await register(values);
      if (onSuccess) onSuccess();
    } catch (err) {
      if (onError) onError(err as Error);
    }
  };

  return (
    <div className={className}>
      <Title level={2}>Register</Title>
      <Form onFinish={handleSubmit}>
        <Form.Item name="username" rules={[{ required: true }]}>
          <Input placeholder="Username" />
        </Form.Item>
        <Form.Item name="email" rules={[{ required: true, type: 'email' }]}>
          <Input placeholder="Email" />
        </Form.Item>
        <Form.Item name="password" rules={[{ required: true, min: 6 }]}>
          <Input.Password placeholder="Password" />
        </Form.Item>
        <Form.Item name="confirm_password" rules={[{ required: true }]}>
          <Input.Password placeholder="Confirm Password" />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={isLoading} block>
          Register
        </Button>
      </Form>
    </div>
  );
}; 