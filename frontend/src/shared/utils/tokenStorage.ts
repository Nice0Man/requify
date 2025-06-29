import Cookies from "js-cookie";

// Token storage keys
const ACCESS_TOKEN_KEY = "requify_access_token";
const REFRESH_TOKEN_KEY = "requify_refresh_token";
const PERMISSIONS_KEY = "requify_permissions";
const USER_KEY = "requify_user";

// Storage configuration
const STORAGE_CONFIG = {
  // Use secure cookies for tokens in production
  secure: import.meta.env.VITE_NODE_ENV === "production",
  sameSite: "strict" as const,
  // Access token expires in 30 minutes
  accessTokenExpiry: 30 / (24 * 60), // Convert minutes to days for js-cookie
  // Refresh token expires in 30 days
  refreshTokenExpiry: 30,
};

class TokenStorage {
  /**
   * Store access token
   */
  setAccessToken(token: string): void {
    try {
      // Store in both cookie and localStorage for redundancy
      Cookies.set(ACCESS_TOKEN_KEY, token, {
        expires: STORAGE_CONFIG.accessTokenExpiry,
        secure: STORAGE_CONFIG.secure,
        sameSite: STORAGE_CONFIG.sameSite,
      });
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } catch (error) {
      console.error("Failed to store access token:", error);
    }
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    try {
      // Try cookie first, fallback to localStorage
      return (
        Cookies.get(ACCESS_TOKEN_KEY) || localStorage.getItem(ACCESS_TOKEN_KEY)
      );
    } catch (error) {
      console.error("Failed to retrieve access token:", error);
      return null;
    }
  }

  /**
   * Store refresh token
   */
  setRefreshToken(token: string): void {
    try {
      // Store in both cookie and localStorage for redundancy
      Cookies.set(REFRESH_TOKEN_KEY, token, {
        expires: STORAGE_CONFIG.refreshTokenExpiry,
        secure: STORAGE_CONFIG.secure,
        sameSite: STORAGE_CONFIG.sameSite,
        httpOnly: false, // Can't be httpOnly in client-side app
      });
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error("Failed to store refresh token:", error);
    }
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    try {
      // Try cookie first, fallback to localStorage
      return (
        Cookies.get(REFRESH_TOKEN_KEY) ||
        localStorage.getItem(REFRESH_TOKEN_KEY)
      );
    } catch (error) {
      console.error("Failed to retrieve refresh token:", error);
      return null;
    }
  }

  /**
   * Store user permissions
   */
  setPermissions(permissions: string[] | undefined | null): void {
    try {
      // Handle undefined or null permissions
      const validPermissions = permissions || [];
      const permissionsStr = JSON.stringify(validPermissions);
      localStorage.setItem(PERMISSIONS_KEY, permissionsStr);
      // Store in cookie with truncation if too large
      if (permissionsStr.length < 4000) {
        // Cookie size limit
        Cookies.set(PERMISSIONS_KEY, permissionsStr, {
          expires: STORAGE_CONFIG.refreshTokenExpiry,
          secure: STORAGE_CONFIG.secure,
          sameSite: STORAGE_CONFIG.sameSite,
        });
      }
    } catch (error) {
      console.error("Failed to store permissions:", error);
    }
  }

  /**
   * Clear permissions data
   */
  clearPermissions(): void {
    try {
      localStorage.removeItem(PERMISSIONS_KEY);
      Cookies.remove(PERMISSIONS_KEY);
    } catch (error) {
      console.error("Failed to clear permissions:", error);
    }
  }

  /**
   * Get user permissions
   */
  getPermissions(): string[] {
    try {
      const permissionsStr =
        localStorage.getItem(PERMISSIONS_KEY) || Cookies.get(PERMISSIONS_KEY);

      // Handle cases where the stored value is invalid
      if (
        !permissionsStr ||
        permissionsStr === "undefined" ||
        permissionsStr === "null"
      ) {
        return [];
      }

      return JSON.parse(permissionsStr);
    } catch (error) {
      console.error("Failed to retrieve permissions:", error);
      // Clear corrupted data
      this.clearPermissions();
      return [];
    }
  }

  /**
   * Store user data
   */
  setUser(user: any): void {
    try {
      const userStr = JSON.stringify(user);
      localStorage.setItem(USER_KEY, userStr);
      // Store in cookie with truncation if too large
      if (userStr.length < 4000) {
        // Cookie size limit
        Cookies.set(USER_KEY, userStr, {
          expires: STORAGE_CONFIG.refreshTokenExpiry,
          secure: STORAGE_CONFIG.secure,
          sameSite: STORAGE_CONFIG.sameSite,
        });
      }
    } catch (error) {
      console.error("Failed to store user data:", error);
    }
  }

  /**
   * Clear user data
   */
  clearUser(): void {
    try {
      localStorage.removeItem(USER_KEY);
      Cookies.remove(USER_KEY);
    } catch (error) {
      console.error("Failed to clear user data:", error);
    }
  }

  /**
   * Get user data
   */
  getUser(): any | null {
    try {
      const userStr = localStorage.getItem(USER_KEY) || Cookies.get(USER_KEY);

      // Handle cases where the stored value is invalid
      if (!userStr || userStr === "undefined" || userStr === "null") {
        return null;
      }

      return JSON.parse(userStr);
    } catch (error) {
      console.error("Failed to retrieve user data:", error);
      // Clear corrupted user data
      this.clearUser();
      return null;
    }
  }

  /**
   * Check if tokens exist
   */
  hasTokens(): boolean {
    try {
      return !!(this.getAccessToken() && this.getRefreshToken());
    } catch {
      return false;
    }
  }

  /**
   * Clear all stored authentication data
   */
  clearAll(): void {
    try {
      // Remove from cookies
      Cookies.remove(ACCESS_TOKEN_KEY);
      Cookies.remove(REFRESH_TOKEN_KEY);
      Cookies.remove(PERMISSIONS_KEY);
      Cookies.remove(USER_KEY);

      // Remove from localStorage
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(PERMISSIONS_KEY);
      localStorage.removeItem(USER_KEY);

      // Legacy cleanup - remove old keys if they exist
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("permissions");
    } catch (error) {
      console.error("Failed to clear authentication data:", error);
    }
  }

  /**
   * Clear any corrupted data
   */
  clearCorruptedData(): void {
    try {
      // Check and clear corrupted permissions
      const permissionsStr = localStorage.getItem(PERMISSIONS_KEY);
      if (permissionsStr === "undefined" || permissionsStr === "null") {
        this.clearPermissions();
      }

      // Check and clear corrupted user data
      const userStr = localStorage.getItem(USER_KEY);
      if (userStr === "undefined" || userStr === "null") {
        this.clearUser();
      }

      // Check and clear corrupted tokens
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (accessToken === "undefined" || accessToken === "null") {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        Cookies.remove(ACCESS_TOKEN_KEY);
      }

      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken === "undefined" || refreshToken === "null") {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        Cookies.remove(REFRESH_TOKEN_KEY);
      }
    } catch (error) {
      console.error("Failed to clear corrupted data:", error);
    }
  }

  /**
   * Migrate from old localStorage keys to new storage system
   */
  migrateFromLegacyStorage(): void {
    try {
      // First clear any corrupted data
      this.clearCorruptedData();

      // Check for old tokens
      const oldAccessToken = localStorage.getItem("accessToken");
      const oldRefreshToken = localStorage.getItem("refreshToken");
      const oldPermissions = localStorage.getItem("permissions");

      if (oldAccessToken && oldRefreshToken) {
        // Migrate to new storage
        this.setAccessToken(oldAccessToken);
        this.setRefreshToken(oldRefreshToken);

        if (oldPermissions) {
          try {
            const permissions = JSON.parse(oldPermissions);
            this.setPermissions(permissions);
          } catch (e) {
            console.warn("Failed to migrate permissions:", e);
          }
        }

        // Remove old keys
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("permissions");

        console.log("Successfully migrated from legacy token storage");
      }
    } catch (error) {
      console.error("Failed to migrate from legacy storage:", error);
    }
  }
}

// Export singleton instance
export const tokenStorage = new TokenStorage();

// Auto-migrate on import
tokenStorage.migrateFromLegacyStorage();
