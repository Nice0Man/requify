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
  setPermissions(permissions: string[]): void {
    try {
      const permissionsStr = JSON.stringify(permissions);
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
   * Get user permissions
   */
  getPermissions(): string[] {
    try {
      const permissionsStr =
        localStorage.getItem(PERMISSIONS_KEY) ||
        Cookies.get(PERMISSIONS_KEY) ||
        "[]";
      return JSON.parse(permissionsStr);
    } catch (error) {
      console.error("Failed to retrieve permissions:", error);
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
   * Get user data
   */
  getUser(): any | null {
    try {
      const userStr = localStorage.getItem(USER_KEY) || Cookies.get(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Failed to retrieve user data:", error);
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
   * Migrate from old localStorage keys to new storage system
   */
  migrateFromLegacyStorage(): void {
    try {
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
