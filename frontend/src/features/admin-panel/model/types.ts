export interface AdminPanelState {
  users: any[];
  systemSettings: any;
  auditLogs: any[];
  isPending: boolean;
  error: string | null;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
}
