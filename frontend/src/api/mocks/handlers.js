import { rest } from 'msw';
import { mockUsers, mockSettings } from './data';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Auth handlers
export const authHandlers = [
  rest.post(`${API_URL}/auth/login`, (req, res, ctx) => {
    const { username, password } = req.body;
    
    // Простая проверка для демонстрации
    if (username === 'admin' && password === 'admin') {
      return res(
        ctx.status(200),
        ctx.json({
          token: 'mock-jwt-token',
          user: {
            id: 1,
            username: 'admin',
            role: 'ADMIN',
            firstName: 'Admin',
            lastName: 'User',
          },
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({ message: 'Неверные учетные данные' })
    );
  }),

  rest.post(`${API_URL}/auth/logout`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ message: 'Успешный выход из системы' })
    );
  }),
];

// Requirements handlers
export const requirementsHandlers = [
  rest.get(`${API_URL}/requirements`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: 1,
          title: 'Авторизация пользователей',
          description: 'Система должна поддерживать авторизацию пользователей',
          status: 'ACTIVE',
          priority: 'HIGH',
          type: 'FUNCTIONAL',
          projectId: 1,
          createdAt: '2024-03-16T10:00:00',
          updatedAt: '2024-03-16T10:00:00',
        },
        {
          id: 2,
          title: 'Управление проектами',
          description: 'Возможность создания и управления проектами',
          status: 'ACTIVE',
          priority: 'HIGH',
          type: 'FUNCTIONAL',
          projectId: 1,
          createdAt: '2024-03-16T10:00:00',
          updatedAt: '2024-03-16T10:00:00',
        },
      ])
    );
  }),

  rest.get(`${API_URL}/requirements/:id`, (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.status(200),
      ctx.json({
        id: parseInt(id),
        title: 'Авторизация пользователей',
        description: 'Система должна поддерживать авторизацию пользователей',
        status: 'ACTIVE',
        priority: 'HIGH',
        type: 'FUNCTIONAL',
        projectId: 1,
        createdAt: '2024-03-16T10:00:00',
        updatedAt: '2024-03-16T10:00:00',
      })
    );
  }),

  rest.post(`${API_URL}/requirements`, (req, res, ctx) => {
    const newRequirement = {
      id: Date.now(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return res(ctx.status(201), ctx.json(newRequirement));
  }),

  rest.put(`${API_URL}/requirements/:id`, (req, res, ctx) => {
    const { id } = req.params;
    const updatedRequirement = {
      id: parseInt(id),
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    return res(ctx.status(200), ctx.json(updatedRequirement));
  }),

  rest.delete(`${API_URL}/requirements/:id`, (req, res, ctx) => {
    return res(ctx.status(204));
  }),
];

// Projects handlers
export const projectsHandlers = [
  rest.get(`${API_URL}/projects`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: 1,
          name: 'Requify',
          description: 'Система управления требованиями',
          status: 'IN_PROGRESS',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          requirements: [1, 2],
          team: [1, 2],
        },
      ])
    );
  }),

  rest.get(`${API_URL}/projects/:id`, (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.status(200),
      ctx.json({
        id: parseInt(id),
        name: 'Requify',
        description: 'Система управления требованиями',
        status: 'IN_PROGRESS',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        requirements: [1, 2],
        team: [1, 2],
      })
    );
  }),

  rest.post(`${API_URL}/projects`, (req, res, ctx) => {
    const newProject = {
      id: Date.now(),
      ...req.body,
    };
    return res(ctx.status(201), ctx.json(newProject));
  }),

  rest.put(`${API_URL}/projects/:id`, (req, res, ctx) => {
    const { id } = req.params;
    const updatedProject = {
      id: parseInt(id),
      ...req.body,
    };
    return res(ctx.status(200), ctx.json(updatedProject));
  }),

  rest.delete(`${API_URL}/projects/:id`, (req, res, ctx) => {
    return res(ctx.status(204));
  }),
];

// Releases handlers
export const releasesHandlers = [
  rest.get(`${API_URL}/releases`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: 1,
          version: '1.0.0',
          name: 'Initial Release',
          description: 'Первая версия системы',
          status: 'PLANNED',
          releaseDate: '2024-06-01',
          projectId: 1,
          requirements: [1, 2],
          changes: [
            {
              id: 1,
              type: 'FEATURE',
              description: 'Базовая функциональность',
              requirementId: 1,
            },
          ],
        },
      ])
    );
  }),

  rest.get(`${API_URL}/releases/:id`, (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.status(200),
      ctx.json({
        id: parseInt(id),
        version: '1.0.0',
        name: 'Initial Release',
        description: 'Первая версия системы',
        status: 'PLANNED',
        releaseDate: '2024-06-01',
        projectId: 1,
        requirements: [1, 2],
        changes: [
          {
            id: 1,
            type: 'FEATURE',
            description: 'Базовая функциональность',
            requirementId: 1,
          },
        ],
      })
    );
  }),

  rest.post(`${API_URL}/releases`, (req, res, ctx) => {
    const newRelease = {
      id: Date.now(),
      ...req.body,
    };
    return res(ctx.status(201), ctx.json(newRelease));
  }),

  rest.put(`${API_URL}/releases/:id`, (req, res, ctx) => {
    const { id } = req.params;
    const updatedRelease = {
      id: parseInt(id),
      ...req.body,
    };
    return res(ctx.status(200), ctx.json(updatedRelease));
  }),

  rest.delete(`${API_URL}/releases/:id`, (req, res, ctx) => {
    return res(ctx.status(204));
  }),
];

// Testing handlers
export const testingHandlers = [
  rest.get(`${API_URL}/tests`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: 1,
          name: 'Тест авторизации',
          description: 'Проверка процесса авторизации',
          status: 'PASSED',
          type: 'FUNCTIONAL',
          priority: 'HIGH',
          requirementId: 1,
          projectId: 1,
          releaseId: 1,
          steps: [
            {
              id: 1,
              description: 'Ввод учетных данных',
              expectedResult: 'Успешная авторизация',
              actualResult: 'Успешная авторизация',
              status: 'PASSED',
            },
          ],
          createdAt: '2024-03-16T10:00:00',
          updatedAt: '2024-03-16T10:00:00',
          assignedTo: 3,
          environment: 'DEVELOPMENT',
          attachments: [],
        },
      ])
    );
  }),

  rest.get(`${API_URL}/tests/:id`, (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.status(200),
      ctx.json({
        id: parseInt(id),
        name: 'Тест авторизации',
        description: 'Проверка процесса авторизации',
        status: 'PASSED',
        type: 'FUNCTIONAL',
        priority: 'HIGH',
        requirementId: 1,
        projectId: 1,
        releaseId: 1,
        steps: [
          {
            id: 1,
            description: 'Ввод учетных данных',
            expectedResult: 'Успешная авторизация',
            actualResult: 'Успешная авторизация',
            status: 'PASSED',
          },
        ],
        createdAt: '2024-03-16T10:00:00',
        updatedAt: '2024-03-16T10:00:00',
        assignedTo: 3,
        environment: 'DEVELOPMENT',
        attachments: [],
      })
    );
  }),

  rest.post(`${API_URL}/tests`, (req, res, ctx) => {
    const newTest = {
      id: Date.now(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return res(ctx.status(201), ctx.json(newTest));
  }),

  rest.put(`${API_URL}/tests/:id`, (req, res, ctx) => {
    const { id } = req.params;
    const updatedTest = {
      id: parseInt(id),
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    return res(ctx.status(200), ctx.json(updatedTest));
  }),

  rest.delete(`${API_URL}/tests/:id`, (req, res, ctx) => {
    return res(ctx.status(204));
  }),

  rest.post(`${API_URL}/tests/:id/steps`, (req, res, ctx) => {
    const { id } = req.params;
    const newStep = {
      id: Date.now(),
      ...req.body,
    };
    return res(ctx.status(201), ctx.json(newStep));
  }),

  rest.put(`${API_URL}/tests/:testId/steps/:stepId`, (req, res, ctx) => {
    const { testId, stepId } = req.params;
    const updatedStep = {
      id: parseInt(stepId),
      ...req.body,
    };
    return res(ctx.status(200), ctx.json(updatedStep));
  }),

  rest.delete(`${API_URL}/tests/:testId/steps/:stepId`, (req, res, ctx) => {
    return res(ctx.status(204));
  }),
];

// Admin handlers
export const adminHandlers = [
  rest.get(`${API_URL}/admin/users`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockUsers));
  }),

  rest.post(`${API_URL}/admin/users`, (req, res, ctx) => {
    const newUser = {
      id: Date.now(),
      ...req.body,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      lastLogin: null,
    };
    return res(ctx.status(201), ctx.json(newUser));
  }),

  rest.put(`${API_URL}/admin/users/:id`, (req, res, ctx) => {
    const { id } = req.params;
    const updatedUser = {
      id: parseInt(id),
      ...req.body,
    };
    return res(ctx.status(200), ctx.json(updatedUser));
  }),

  rest.delete(`${API_URL}/admin/users/:id`, (req, res, ctx) => {
    return res(ctx.status(204));
  }),

  rest.get(`${API_URL}/admin/settings`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockSettings));
  }),

  rest.put(`${API_URL}/admin/settings`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(req.body));
  }),
]; 