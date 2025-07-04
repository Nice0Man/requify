// Auth storage - handles token persistence and user data caching

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'requify_access_token',
  REFRESH_TOKEN: 'requify_refresh_token',
  TOKEN_EXPIRY: 'requify_token_expiry',
  USER_DATA: 'requify_user_data',
  PERMISSIONS: 'requify_permissions',
  REMEMBER_ME: 'requify_remember_me',
  LAST_LOGIN: 'requify_last_login',
} as const;

export class AuthStorage {
  private useSessionStorage = false;

  constructor(persistent = true) {
    this.useSessionStorage = !persistent;
  }

  private getStorage(): Storage {
    return this.useSessionStorage ? sessionStorage : localStorage;
  }

  // =============================================================================
  // Token Management
  // =============================================================================

  setAccessToken(token: string): void {
    this.getStorage().setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  }

  getAccessToken(): string | null {
    return this.getStorage().getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  setRefreshToken(token: string): void {
    this.getStorage().setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  }

  getRefreshToken(): string | null {
    return this.getStorage().getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  setTokenExpiry(expiry: Date): void {
    this.getStorage().setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiry.toISOString());
  }

  getTokenExpiry(): Date | null {
    const expiry = this.getStorage().getItem(STORAGE_KEYS.TOKEN_EXPIRY);
    return expiry ? new Date(expiry) : null;
  }

  setTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
    const expiry = new Date(Date.now() + expiresIn * 1000);
    
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
    this.setTokenExpiry(expiry);
  }

  clearTokens(): void {
    this.getStorage().removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    this.getStorage().removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    this.getStorage().removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
  }

  isTokenExpired(): boolean {
    const expiry = this.getTokenExpiry();
    if (!expiry) return true;
    
    // Add 30 seconds buffer to prevent edge cases
    return Date.now() >= expiry.getTime() - 30000;
  }

  // =============================================================================
  // User Data Management
  // =============================================================================

  setUserData(userData: any): void {
    this.getStorage().setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  }

  getUserData(): any | null {
    const data = this.getStorage().getItem(STORAGE_KEYS.USER_DATA);
    try {
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  clearUserData(): void {
    this.getStorage().removeItem(STORAGE_KEYS.USER_DATA);
  }

  // =============================================================================
  // Permissions Management
  // =============================================================================

  setPermissions(permissions: string[]): void {
    this.getStorage().setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(permissions));
  }

  getPermissions(): string[] {
    const data = this.getStorage().getItem(STORAGE_KEYS.PERMISSIONS);
    try {
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  clearPermissions(): void {
    this.getStorage().removeItem(STORAGE_KEYS.PERMISSIONS);
  }

  // =============================================================================
  // Session Preferences
  // =============================================================================

  setRememberMe(remember: boolean): void {
    if (remember) {
      localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
    }
  }

  getRememberMe(): boolean {
    return localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === 'true';
  }

  setLastLogin(timestamp: Date = new Date()): void {
    localStorage.setItem(STORAGE_KEYS.LAST_LOGIN, timestamp.toISOString());
  }

  getLastLogin(): Date | null {
    const timestamp = localStorage.getItem(STORAGE_KEYS.LAST_LOGIN);
    return timestamp ? new Date(timestamp) : null;
  }

  // =============================================================================
  // Full Cleanup
  // =============================================================================

  clearAll(): void {
    this.clearTokens();
    this.clearUserData();
    this.clearPermissions();
    // Note: Keep remember_me and last_login for user experience
  }

  clearAllIncludingPreferences(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  }

  // =============================================================================
  // Storage Event Handling
  // =============================================================================

  onStorageChange(callback: (key: string, newValue: string | null) => void): () => void {
    const handler = (event: StorageEvent) => {
      if (event.key && Object.values(STORAGE_KEYS).includes(event.key as any)) {
        callback(event.key, event.newValue);
      }
    };

    window.addEventListener('storage', handler);
    
    // Return cleanup function
    return () => window.removeEventListener('storage', handler);
  }

  // =============================================================================
  // Migration and Validation
  // =============================================================================

  validateStoredData(): boolean {
    try {
      // Check if tokens exist and are valid format
      const accessToken = this.getAccessToken();
      const refreshToken = this.getRefreshToken();
      const expiry = this.getTokenExpiry();

      if (accessToken && refreshToken && expiry) {
        // Basic validation - tokens should be non-empty strings
        if (typeof accessToken === 'string' && 
            typeof refreshToken === 'string' && 
            expiry instanceof Date) {
          return true;
        }
      }

      return false;
    } catch {
      return false;
    }
  }

  migrateFromOldStorage(): void {
    // Migration logic for any old storage formats
    // This can be extended as needed for backward compatibility
    const oldTokenKey = 'auth_token'; // Example old key
    const oldToken = localStorage.getItem(oldTokenKey);
    
    if (oldToken && !this.getAccessToken()) {
      this.setAccessToken(oldToken);
      localStorage.removeItem(oldTokenKey);
    }
  }
}

// Export singleton instances
export const authStorage = new AuthStorage(true); // Persistent storage
export const sessionAuthStorage = new AuthStorage(false); // Session-only storage 