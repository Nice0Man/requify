import type { UserProfile } from "@/entities/user";
import type { AuthStorageData } from "./auth.types";
import { AUTH_STORAGE_KEYS } from "./auth.types";

export class AuthStorage {
  // Add 30 seconds buffer to prevent edge cases
  clearAuthData() {
      throw new Error("Method not implemented.");
  }
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
    this.getStorage().setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, token);
  }

  getAccessToken(): string | null {
    return this.getStorage().getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  }

  setRefreshToken(token: string): void {
    this.getStorage().setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, token);
  }

  getRefreshToken(): string | null {
    return this.getStorage().getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
  }

  setTokenExpiry(expiry: number): void {
    this.getStorage().setItem(AUTH_STORAGE_KEYS.TOKEN_EXPIRY, expiry.toString());
  }

  getTokenExpiry(): number | null {
    const expiry = this.getStorage().getItem(AUTH_STORAGE_KEYS.TOKEN_EXPIRY);
    return expiry ? parseInt(expiry, 10) : null;
  }

  setTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
    const expiry = Date.now() + expiresIn * 1000;
    
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
    this.setTokenExpiry(expiry);
  }

  clearTokens(): void {
    this.getStorage().removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    this.getStorage().removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    this.getStorage().removeItem(AUTH_STORAGE_KEYS.TOKEN_EXPIRY);
  }

  isTokenExpired(): boolean {
    const expiry = this.getTokenExpiry();
    if (!expiry) return true;
    
    // Add 30 seconds buffer to prevent edge cases
    return Date.now() >= expiry - 30000;
  }

  // =============================================================================
  // User Data Management
  // =============================================================================

  setUserData(userData: UserProfile): void {
    this.getStorage().setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(userData));
  }

  getUserData(): UserProfile | null {
    const data = this.getStorage().getItem(AUTH_STORAGE_KEYS.USER);
    try {
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  clearUserData(): void {
    this.getStorage().removeItem(AUTH_STORAGE_KEYS.USER);
  }

  // =============================================================================
  // Permissions Management
  // =============================================================================

  setPermissions(permissions: string[]): void {
    this.getStorage().setItem(AUTH_STORAGE_KEYS.PERMISSIONS, JSON.stringify(permissions));
  }

  getPermissions(): string[] {
    const data = this.getStorage().getItem(AUTH_STORAGE_KEYS.PERMISSIONS);
    try {
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  clearPermissions(): void {
    this.getStorage().removeItem(AUTH_STORAGE_KEYS.PERMISSIONS);
  }

  // =============================================================================
  // Complete Auth Data Management
  // =============================================================================

  setAuthData(data: AuthStorageData): void {
    this.setAccessToken(data.accessToken);
    this.setRefreshToken(data.refreshToken);
    this.setTokenExpiry(data.tokenExpiry);
    this.setUserData(data.user);
    this.setPermissions(data.permissions);
  }

  getAuthData(): AuthStorageData | null {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    const tokenExpiry = this.getTokenExpiry();
    const user = this.getUserData();
    const permissions = this.getPermissions();

    if (!accessToken || !refreshToken || !tokenExpiry || !user) {
      return null;
    }

    return {
      accessToken,
      refreshToken,
      tokenExpiry,
      user,
      permissions,
    };
  }

  // =============================================================================
  // Session Preferences
  // =============================================================================

  setRememberMe(remember: boolean): void {
    if (remember) {
      localStorage.setItem("requify_remember_me", "true");
    } else {
      localStorage.removeItem("requify_remember_me");
    }
  }

  getRememberMe(): boolean {
    return localStorage.getItem("requify_remember_me") === "true";
  }

  setLastLogin(timestamp: Date = new Date()): void {
    localStorage.setItem("requify_last_login", timestamp.toISOString());
  }

  getLastLogin(): Date | null {
    const timestamp = localStorage.getItem("requify_last_login");
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
    Object.values(AUTH_STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    // Clear additional preferences
    localStorage.removeItem("requify_remember_me");
    localStorage.removeItem("requify_last_login");
  }

  // =============================================================================
  // Storage Event Handling
  // =============================================================================

  onStorageChange(callback: (key: string, newValue: string | null) => void): () => void {
    const handler = (event: StorageEvent) => {
      if (event.key && Object.values(AUTH_STORAGE_KEYS).includes(event.key as any)) {
        callback(event.key, event.newValue);
      }
    };

    window.addEventListener("storage", handler);
    
    // Return cleanup function
    return () => window.removeEventListener("storage", handler);
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
      const user = this.getUserData();

      if (accessToken && refreshToken && expiry && user) {
        // Basic validation - tokens should be non-empty strings
        if (typeof accessToken === "string" && 
            typeof refreshToken === "string" && 
            typeof expiry === "number" &&
            typeof user === "object") {
          return true;
        }
      }

      return false;
    } catch {
      return false;
    }
  }

  migrateFromOldStorage(): void {
    try {
      // Migration logic for old storage keys
      const oldKeys = [
        "requify_access_token",
        "requify_refresh_token", 
        "requify_user_data",
        "requify_permissions",
        "requify_token_expiry"
      ];

      let migrated = false;

      oldKeys.forEach(oldKey => {
        const value = localStorage.getItem(oldKey);
        if (value) {
          // Map old keys to new keys
          switch (oldKey) {
            case "requify_user_data":
              localStorage.setItem(AUTH_STORAGE_KEYS.USER, value);
              break;
            default:
              // For keys that match, just ensure they exist with new constants
              break;
          }
          migrated = true;
        }
      });

      if (migrated) {
        console.log("Auth storage migrated from old format");
      }
    } catch (error) {
      console.warn("Failed to migrate auth storage:", error);
    }
  }

  // =============================================================================
  // Debug and Development
  // =============================================================================

  getDebugInfo(): Record<string, any> {
    return {
      hasAccessToken: !!this.getAccessToken(),
      hasRefreshToken: !!this.getRefreshToken(),
      tokenExpiry: this.getTokenExpiry(),
      isTokenExpired: this.isTokenExpired(),
      hasUserData: !!this.getUserData(),
      permissionsCount: this.getPermissions().length,
      rememberMe: this.getRememberMe(),
      lastLogin: this.getLastLogin(),
      storageType: this.useSessionStorage ? "session" : "local",
    };
  }
}

// Export singleton instances
export const authStorage = new AuthStorage(true); // Persistent storage
export const sessionAuthStorage = new AuthStorage(false); // Session storage 