import React from 'react';
import { Layout, Card, Typography } from 'antd';

const { Content } = Layout;
const { Title } = Typography;

export interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  maxWidth?: number;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title = "Requify",
  subtitle = "Requirements Management Platform",
  maxWidth = 400,
}) => {
  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '20px'
      }}>
        <Card 
          style={{ 
            width: '100%', 
            maxWidth,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={1} style={{ color: '#1890ff', marginBottom: 8 }}>
              {title}
            </Title>
            <Typography.Text type="secondary">
              {subtitle}
            </Typography.Text>
          </div>
          {children}
        </Card>
      </Content>
    </Layout>
  );
}; 