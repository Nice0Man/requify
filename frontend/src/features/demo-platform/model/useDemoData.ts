import { useState, useEffect } from 'react';
import {
  demoProjects,
  demoRequirements,
  demoTests,
  demoMetrics,
  demoActivities,
  demoUsers,
  DemoProject,
  DemoRequirement,
  DemoTest,
  DemoMetrics,
  DemoActivity,
  DemoUser,
} from '@/entities/demo';

export interface DemoDataState {
  projects: DemoProject[];
  requirements: DemoRequirement[];
  tests: DemoTest[];
  metrics: DemoMetrics;
  activities: DemoActivity[];
  users: DemoUser[];
  isLoading: boolean;
}

export const useDemoData = () => {
  const [state, setState] = useState<DemoDataState>({
    projects: [],
    requirements: [],
    tests: [],
    metrics: {} as DemoMetrics,
    activities: [],
    users: [],
    isLoading: true,
  });

  // Симуляция загрузки данных
  useEffect(() => {
    const loadDemoData = async () => {
      // Симулируем задержку загрузки
      await new Promise(resolve => setTimeout(resolve, 1000));

      setState({
        projects: demoProjects,
        requirements: demoRequirements,
        tests: demoTests,
        metrics: demoMetrics,
        activities: demoActivities,
        users: demoUsers,
        isLoading: false,
      });
    };

    loadDemoData();
  }, []);

  // Получить проект по ID
  const getProjectById = (id: string): DemoProject | undefined => {
    return state.projects.find(project => project.id === id);
  };

  // Получить требования проекта
  const getProjectRequirements = (projectId: string): DemoRequirement[] => {
    return state.requirements.filter(req => req.projectId === projectId);
  };

  // Получить активности проекта
  const getProjectActivities = (projectId: string): DemoActivity[] => {
    return state.activities.filter(activity => activity.projectId === projectId);
  };

  // Получить тесты для требования
  const getRequirementTests = (requirementId: string): DemoTest[] => {
    return state.tests.filter(test => test.requirementId === requirementId);
  };

  // Получить статистику по статусам требований
  const getRequirementStats = () => {
    const stats = state.requirements.reduce((acc, req) => {
      acc[req.status] = (acc[req.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return stats;
  };

  // Получить статистику тестов
  const getTestStats = () => {
    const stats = state.tests.reduce((acc, test) => {
      acc[test.status] = (acc[test.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return stats;
  };

  return {
    ...state,
    getProjectById,
    getProjectRequirements,
    getProjectActivities,
    getRequirementTests,
    getRequirementStats,
    getTestStats,
  };
}; 