import React from 'react';
import { Progress, Space, Typography, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import type { Release } from '../model/types';

const { Text } = Typography;

interface ReleaseProgressProps {
  release: Release & { progress?: number; total_requirements?: number; completed_requirements?: number };
  size?: 'small' | 'default' | 'large';
  showText?: boolean;
  showTooltip?: boolean;
  format?: 'line' | 'circle' | 'dashboard';
  className?: string;
}

export const ReleaseProgress: React.FC<ReleaseProgressProps> = ({
  release,
  size = 'default',
  showText = true,
  showTooltip = true,
  format = 'line',
  className,
}) => {
  const getProgress = () => {
    if (release.progress !== undefined) {
      return release.progress;
    }
    
    if (release.total_requirements && release.completed_requirements !== undefined) {
      return Math.round((release.completed_requirements / release.total_requirements) * 100);
    }
    
    // Default progress based on status
    switch (release.status?.toLowerCase()) {
      case 'draft': return 0;
      case 'planned': return 10;
      case 'in_progress': return 50;
      case 'testing': return 80;
      case 'ready': return 95;
      case 'published':
      case 'released': return 100;
      case 'cancelled': return 0;
      default: return 0;
    }
  };

  const progress = getProgress();
  
  const getProgressColor = () => {
    if (progress >= 100) return '#52c41a';
    if (progress >= 80) return '#389e0d';
    if (progress >= 60) return '#fadb14';
    if (progress >= 40) return '#fa8c16';
    return '#ff4d4f';
  };

  const getProgressSize = () => {
    if (format === 'circle' || format === 'dashboard') {
      return size === 'small' ? 60 : size === 'large' ? 120 : 80;
    }
    return size;
  };

  const tooltipContent = showTooltip ? (
    <div>
      <div>Progress: {progress}%</div>
      {release.total_requirements && (
        <>
          <div>Completed: {release.completed_requirements || 0}</div>
          <div>Total: {release.total_requirements}</div>
        </>
      )}
      <div>Status: {release.status}</div>
      {release.release_date && (
        <div>Release Date: {new Date(release.release_date).toLocaleDateString()}</div>
      )}
    </div>
  ) : null;

  const progressElement = (
    <Progress
      type={format}
      percent={progress}
      strokeColor={getProgressColor()}
      size={getProgressSize() as any}
      showInfo={showText && format !== 'line'}
      className={className}
    />
  );

  if (format === 'line') {
    return (
      <div className={className}>
        {showText && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <Space size="small">
              <Text style={{ fontSize: size === 'small' ? '12px' : '14px' }}>
                Progress
              </Text>
              {showTooltip && (
                <Tooltip title={tooltipContent}>
                  <InfoCircleOutlined style={{ color: '#999', fontSize: '12px' }} />
                </Tooltip>
              )}
            </Space>
            <Text style={{ fontSize: size === 'small' ? '12px' : '14px' }}>
              {progress}%
            </Text>
          </div>
        )}
        
        {showTooltip ? (
          <Tooltip title={tooltipContent}>
            {progressElement}
          </Tooltip>
        ) : (
          progressElement
        )}
        
        {showText && release.total_requirements && (
          <div style={{ marginTop: 4 }}>
            <Text 
              type="secondary" 
              style={{ fontSize: size === 'small' ? '11px' : '12px' }}
            >
              {release.completed_requirements || 0} of {release.total_requirements} requirements
            </Text>
          </div>
        )}
      </div>
    );
  }

  // For circle and dashboard formats
  return (
    <div className={className} style={{ textAlign: 'center' }}>
      {showTooltip ? (
        <Tooltip title={tooltipContent}>
          {progressElement}
        </Tooltip>
      ) : (
        progressElement
      )}
      
      {showText && (
        <div style={{ marginTop: 8 }}>
          <Text style={{ fontSize: size === 'small' ? '12px' : '14px' }}>
            {release.total_requirements ? 
              `${release.completed_requirements || 0} / ${release.total_requirements}` : 
              `${progress}%`
            }
          </Text>
          {release.total_requirements && (
            <>
              <br />
              <Text 
                type="secondary" 
                style={{ fontSize: size === 'small' ? '11px' : '12px' }}
              >
                requirements completed
              </Text>
            </>
          )}
        </div>
      )}
    </div>
  );
}; 