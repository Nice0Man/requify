import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Alert, Typography, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useAuth } from '../model';
import type { LoginFormData } from '../model';

const { Title, Text } = Typography;

export interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showRememberMe?: boolean;
  showForgotPassword?: boolean;
  showRegisterLink?: boolean;
  redirectAfterLogin?: boolean;
  className?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onError,
  showRememberMe = true,
  showForgotPassword = true,
  showRegisterLink = true,
  redirectAfterLogin = true,
  className,
}) => {
  const [form] = Form.useForm();
  const { login, isLoading, error, clearError } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: LoginFormData) => {
    try {
      setIsSubmitting(true);
      clearError();
      
      await login(values);
      
      if (onSuccess) {
        onSuccess();
      }
      
      if (redirectAfterLogin) {
        // Redirect will be handled by auth context/navigation
      }
    } catch (err) {
      const error = err as Error;
      if (onError) {
        onError(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormChange = () => {
    if (error) {
      clearError();
    }
  };

  return (
    <div className={className}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <Title level={2}>Sign In</Title>
          <Text type="secondary">
            Welcome back! Please sign in to your account.
          </Text>
        </div>

        {error && (
          <Alert
            message="Login Failed"
            description={error.message}
            type="error"
            showIcon
            closable
            onClose={clearError}
          />
        )}

        <Form
          form={form}
          name="login"
          layout="vertical"
          onFinish={handleSubmit}
          onFieldsChange={handleFormChange}
          size="large"
          autoComplete="on"
        >
          <Form.Item
            name="username"
            label="Username or Email"
            rules={[
              {
                required: true,
                message: 'Please enter your username or email',
              },
              {
                type: 'string',
                min: 3,
                message: 'Username must be at least 3 characters',
              },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter username or email"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              {
                required: true,
                message: 'Please enter your password',
              },
              {
                min: 6,
                message: 'Password must be at least 6 characters',
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter password"
              autoComplete="current-password"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {showRememberMe && (
                <Form.Item name="remember_me" valuePropName="checked" noStyle>
                  <Checkbox>Remember me</Checkbox>
                </Form.Item>
              )}
              
              {showForgotPassword && (
                <Link to="/auth/forgot-password">
                  <Text type="secondary">Forgot password?</Text>
                </Link>
              )}
            </div>
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading || isSubmitting}
              block
              size="large"
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        {showRegisterLink && (
          <>
            <Divider>
              <Text type="secondary">New to our platform?</Text>
            </Divider>
            
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">
                Don't have an account?{' '}
                <Link to="/auth/register">
                  <Text strong>Sign up here</Text>
                </Link>
              </Text>
            </div>
          </>
        )}
      </Space>
    </div>
  );
}; 