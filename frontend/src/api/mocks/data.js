export const mockUsers = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    role: 'ADMIN',
    status: 'ACTIVE',
    firstName: 'Admin',
    lastName: 'User',
    department: 'IT',
    lastLogin: '2024-03-16T10:00:00',
    createdAt: '2024-01-01T00:00:00',
  },
  {
    id: 2,
    username: 'manager',
    email: 'manager@example.com',
    role: 'MANAGER',
    status: 'ACTIVE',
    firstName: 'Project',
    lastName: 'Manager',
    department: 'Project Management',
    lastLogin: '2024-03-15T15:30:00',
    createdAt: '2024-01-02T00:00:00',
  },
  {
    id: 3,
    username: 'tester',
    email: 'tester@example.com',
    role: 'TESTER',
    status: 'ACTIVE',
    firstName: 'QA',
    lastName: 'Engineer',
    department: 'Quality Assurance',
    lastLogin: '2024-03-16T09:15:00',
    createdAt: '2024-01-03T00:00:00',
  },
];

export const mockSettings = {
  system: {
    name: 'Requify',
    version: '1.0.0',
    environment: 'PRODUCTION',
    maintenanceMode: false,
    maxFileSize: 10, // MB
    allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg'],
  },
  notifications: {
    emailNotifications: true,
    slackNotifications: false,
    notificationTypes: ['REQUIREMENT_UPDATED', 'TEST_FAILED', 'RELEASE_CREATED'],
  },
  security: {
    passwordExpiryDays: 90,
    maxLoginAttempts: 5,
    sessionTimeoutMinutes: 30,
    twoFactorAuth: false,
  },
  backup: {
    autoBackup: true,
    backupFrequency: 'DAILY',
    retentionDays: 30,
    lastBackup: '2024-03-16T00:00:00',
  },
}; 