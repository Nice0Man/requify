/**
 * Company Data Access Object (DAO)
 * Основано на схемах из backend/app/schemas/company.py
 */

import { client } from "@/app/providers/client";
import { API_ENDPOINTS } from "@/shared/api/endpoints";
import type {
  Company,
  CompanyCreate,
  CompanyUpdate,
  CompanyBranding,
  CompanyBrandingCreate,
  CompanyBrandingUpdate,
  CompanySettings,
  CompanySettingsUpdate,
  CompanySubscription,
  CompanySubscriptionUpdate,
  CompanyContact,
  CompanyContactCreate,
  CompanyContactUpdate,
  CompanyListResponse,
  CompanyDetailResponse,
  CompanyQueryParams,
  CompanyBulkOperation,
  CompanyValidationResult,
  CompanyStatsResponse,
} from "../model/types";

/**
 * CompanyDAO - класс для работы с API компаний
 */
export class CompanyDAO {
  private static instance: CompanyDAO;

  private constructor() {}

  /**
   * Получить singleton instance
   */
  public static getInstance(): CompanyDAO {
    if (!CompanyDAO.instance) {
      CompanyDAO.instance = new CompanyDAO();
    }
    return CompanyDAO.instance;
  }

  // === CRUD операции ===

  /**
   * Получить список компаний
   */
  async getCompanies(params?: CompanyQueryParams): Promise<CompanyListResponse> {
    try {
      const response = await client.get<CompanyListResponse>(
        API_ENDPOINTS.COMPANIES.LIST,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get companies:", error);
      throw error;
    }
  }

  /**
   * Получить компанию по ID
   */
  async getCompanyById(id: string): Promise<CompanyDetailResponse> {
    try {
      const response = await client.get<CompanyDetailResponse>(
        API_ENDPOINTS.COMPANIES.GET(id)
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get company ${id}:`, error);
      throw error;
    }
  }

  /**
   * Создать новую компанию
   */
  async createCompany(data: CompanyCreate): Promise<Company> {
    try {
      const response = await client.post<Company>(
        API_ENDPOINTS.COMPANIES.CREATE,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Failed to create company:", error);
      throw error;
    }
  }

  /**
   * Обновить компанию
   */
  async updateCompany(id: string, data: CompanyUpdate): Promise<Company> {
    try {
      const response = await client.put<Company>(
        API_ENDPOINTS.COMPANIES.UPDATE(id),
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to update company ${id}:`, error);
      throw error;
    }
  }

  /**
   * Удалить компанию
   */
  async deleteCompany(id: string): Promise<void> {
    try {
      await client.delete(API_ENDPOINTS.COMPANIES.DELETE(id));
    } catch (error) {
      console.error(`Failed to delete company ${id}:`, error);
      throw error;
    }
  }

  /**
   * Активировать компанию
   */
  async activateCompany(id: string): Promise<Company> {
    try {
      const response = await client.post<Company>(
        API_ENDPOINTS.COMPANIES.ACTIVATE(id)
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to activate company ${id}:`, error);
      throw error;
    }
  }

  /**
   * Деактивировать компанию
   */
  async deactivateCompany(id: string): Promise<Company> {
    try {
      const response = await client.post<Company>(
        API_ENDPOINTS.COMPANIES.DEACTIVATE(id)
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to deactivate company ${id}:`, error);
      throw error;
    }
  }

  /**
   * Получить статистику компании
   */
  async getCompanyStats(id: string): Promise<CompanyStatsResponse> {
    try {
      const response = await client.get<CompanyStatsResponse>(
        API_ENDPOINTS.COMPANIES.STATS(id)
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get company stats ${id}:`, error);
      throw error;
    }
  }

  // === Company Branding операции ===

  /**
   * Получить брендинг компании
   */
  async getCompanyBranding(companyId: string): Promise<CompanyBranding> {
    try {
      const response = await client.get<CompanyBranding>(
        API_ENDPOINTS.COMPANIES.BRANDING(companyId)
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get company branding ${companyId}:`, error);
      throw error;
    }
  }

  /**
   * Обновить брендинг компании
   */
  async updateCompanyBranding(
    companyId: string,
    data: CompanyBrandingUpdate
  ): Promise<CompanyBranding> {
    try {
      const response = await client.put<CompanyBranding>(
        API_ENDPOINTS.COMPANIES.UPDATE_BRANDING(companyId),
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to update company branding ${companyId}:`, error);
      throw error;
    }
  }

  /**
   * Загрузить логотип компании
   */
  async uploadCompanyLogo(companyId: string, file: File): Promise<{ logo_url: string }> {
    try {
      const formData = new FormData();
      formData.append("logo", file);

      const response = await client.post<{ logo_url: string }>(
        API_ENDPOINTS.COMPANIES.UPLOAD_LOGO(companyId),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to upload company logo ${companyId}:`, error);
      throw error;
    }
  }

  /**
   * Удалить логотип компании
   */
  async deleteCompanyLogo(companyId: string): Promise<void> {
    try {
      await client.delete(API_ENDPOINTS.COMPANIES.DELETE_LOGO(companyId));
    } catch (error) {
      console.error(`Failed to delete company logo ${companyId}:`, error);
      throw error;
    }
  }

  // === Company Settings операции ===

  /**
   * Получить настройки компании
   */
  async getCompanySettings(companyId: string): Promise<CompanySettings> {
    try {
      const response = await client.get<CompanySettings>(
        API_ENDPOINTS.COMPANIES.SETTINGS(companyId)
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get company settings ${companyId}:`, error);
      throw error;
    }
  }

  /**
   * Обновить настройки компании
   */
  async updateCompanySettings(
    companyId: string,
    data: CompanySettingsUpdate
  ): Promise<CompanySettings> {
    try {
      const response = await client.put<CompanySettings>(
        API_ENDPOINTS.COMPANIES.UPDATE_SETTINGS(companyId),
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to update company settings ${companyId}:`, error);
      throw error;
    }
  }

  // === Company Subscription операции ===

  /**
   * Получить подписку компании
   */
  async getCompanySubscription(companyId: string): Promise<CompanySubscription> {
    try {
      const response = await client.get<CompanySubscription>(
        API_ENDPOINTS.COMPANIES.SUBSCRIPTION(companyId)
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get company subscription ${companyId}:`, error);
      throw error;
    }
  }

  /**
   * Обновить подписку компании
   */
  async updateCompanySubscription(
    companyId: string,
    data: CompanySubscriptionUpdate
  ): Promise<CompanySubscription> {
    try {
      const response = await client.put<CompanySubscription>(
        API_ENDPOINTS.COMPANIES.UPDATE_SUBSCRIPTION(companyId),
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to update company subscription ${companyId}:`, error);
      throw error;
    }
  }

  /**
   * Получить биллинг информацию
   */
  async getCompanyBilling(companyId: string): Promise<any> {
    try {
      const response = await client.get(
        API_ENDPOINTS.COMPANIES.BILLING(companyId)
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get company billing ${companyId}:`, error);
      throw error;
    }
  }

  /**
   * Получить использование ресурсов
   */
  async getCompanyUsage(companyId: string): Promise<any> {
    try {
      const response = await client.get(
        API_ENDPOINTS.COMPANIES.USAGE(companyId)
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get company usage ${companyId}:`, error);
      throw error;
    }
  }

  // === Company Contacts операции ===

  /**
   * Получить контакты компании
   */
  async getCompanyContacts(companyId: string): Promise<CompanyContact[]> {
    try {
      const response = await client.get<CompanyContact[]>(
        API_ENDPOINTS.COMPANIES.CONTACTS(companyId)
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get company contacts ${companyId}:`, error);
      throw error;
    }
  }

  /**
   * Создать контакт компании
   */
  async createCompanyContact(
    companyId: string,
    data: CompanyContactCreate
  ): Promise<CompanyContact> {
    try {
      const response = await client.post<CompanyContact>(
        API_ENDPOINTS.COMPANIES.CREATE_CONTACT(companyId),
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to create company contact ${companyId}:`, error);
      throw error;
    }
  }

  /**
   * Получить контакт компании
   */
  async getCompanyContact(
    companyId: string,
    contactId: string
  ): Promise<CompanyContact> {
    try {
      const response = await client.get<CompanyContact>(
        API_ENDPOINTS.COMPANIES.GET_CONTACT(companyId, contactId)
      );
      return response.data;
    } catch (error) {
      console.error(
        `Failed to get company contact ${companyId}/${contactId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Обновить контакт компании
   */
  async updateCompanyContact(
    companyId: string,
    contactId: string,
    data: CompanyContactUpdate
  ): Promise<CompanyContact> {
    try {
      const response = await client.put<CompanyContact>(
        API_ENDPOINTS.COMPANIES.UPDATE_CONTACT(companyId, contactId),
        data
      );
      return response.data;
    } catch (error) {
      console.error(
        `Failed to update company contact ${companyId}/${contactId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Удалить контакт компании
   */
  async deleteCompanyContact(
    companyId: string,
    contactId: string
  ): Promise<void> {
    try {
      await client.delete(
        API_ENDPOINTS.COMPANIES.DELETE_CONTACT(companyId, contactId)
      );
    } catch (error) {
      console.error(
        `Failed to delete company contact ${companyId}/${contactId}:`,
        error
      );
      throw error;
    }
  }

  // === Bulk операции ===

  /**
   * Выполнить массовую операцию над компаниями
   */
  async bulkOperation(operation: CompanyBulkOperation): Promise<{ affected_count: number }> {
    try {
      const response = await client.post<{ affected_count: number }>(
        "/companies/bulk",
        operation
      );
      return response.data;
    } catch (error) {
      console.error("Failed to perform bulk operation:", error);
      throw error;
    }
  }

  // === Validation операции ===

  /**
   * Валидировать данные компании
   */
  async validateCompany(data: CompanyCreate | CompanyUpdate): Promise<CompanyValidationResult> {
    try {
      const response = await client.post<CompanyValidationResult>(
        "/companies/validate",
        data
      );
      return response.data;
    } catch (error) {
      console.error("Failed to validate company:", error);
      throw error;
    }
  }
}

// Экспорт singleton instance
export const companyDAO = CompanyDAO.getInstance();