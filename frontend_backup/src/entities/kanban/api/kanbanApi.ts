import type { 
  KanbanCard, 
  KanbanType, 
  KanbanItemCreateRequest,
  KanbanItemUpdateRequest,
} from '../model/types';
import { transformToKanbanCard } from '../model/utils';

// Import existing entity APIs according to FSD
import { projectDAO } from '@/entities/project';
import { requirementDAO } from '@/entities/requirement';
// TODO: Import release and test case APIs when implemented
// import { releaseAPI } from '@/entities/release';
// import { testCaseAPI } from '@/entities/test-case';

interface KanbanApiParams {
  project_id?: number;
  requirement_id?: number;
  limit?: number;
  page?: number;
  status?: string;
}

// Universal Kanban API functions
export const kanbanApi = {
  // Get items for any kanban type
  async getKanbanItems(type: KanbanType, params: KanbanApiParams = {}): Promise<KanbanCard[]> {
    try {
      let items: any[] = [];
      
      switch (type) {
        case 'projects':
          const projectsResponse = await projectDAO.getProjects({
            page: params.page || 1,
            limit: params.limit || 100,
            status: params.status as any,
          });
          items = projectsResponse.projects || [];
          break;

        case 'requirements':
          const requirementsResponse = await requirementDAO.getRequirements({
            project_id: params.project_id,
            page: params.page || 1,
            per_page: params.limit || 100,
          });
          items = requirementsResponse.requirements || [];
          break;

        case 'releases':
          // TODO: Implement proper release API methods
          items = [];
          break;

        case 'tests':
          // TODO: Implement proper test case API methods  
          items = [];
          break;

        default:
          throw new Error(`Unsupported kanban type: ${type}`);
      }

      return items.map(item => transformToKanbanCard(item, type));
    } catch (error) {
      console.error(`Error loading ${type} kanban items:`, error);
      return [];
    }
  },

  // Update item status (drag & drop)
  async updateItemStatus(type: KanbanType, itemId: number, newStatus: string): Promise<boolean> {
    try {
      switch (type) {
        case 'projects':
          await projectDAO.updateProject(itemId, { status: newStatus });
          break;

        case 'requirements':
          // NOTE: Требования используют status_id вместо status как строку
          // TODO: Нужно получить status_id по имени статуса
          console.warn('Requirement status update needs status_id mapping');
          break;

        case 'releases':
          // TODO: Implement proper release API methods
          break;

        case 'tests':
          // TODO: Implement proper test case API methods
          break;

        default:
          throw new Error(`Unsupported kanban type: ${type}`);
      }

      return true;
    } catch (error) {
      console.error(`Error updating ${type} item status:`, error);
      return false;
    }
  },

  // Create new item
  async createItem(type: KanbanType, data: KanbanItemCreateRequest): Promise<KanbanCard | null> {
    try {
      let newItem: any;

      switch (type) {
        case 'projects':
          newItem = await projectDAO.createProject({
            name: data.title,
            description: data.description || '',
            status: data.status,
            code: `PROJ_${Date.now()}`, // Генерируем код проекта
          });
          break;

        case 'requirements':
          if (!data.project_id) {
            throw new Error('project_id is required for requirement creation');
          }
          
          newItem = await requirementDAO.createRequirement({
            title: data.title,
            description: data.description || '',
            project_id: data.project_id,
            type_id: 1, // TODO: Получать из конфигурации
            priority_id: 1, // TODO: Получать из конфигурации
            status_id: 1, // TODO: Получать из конфигурации
            progress: 0,
          });
          break;

        case 'releases':
          // TODO: Implement proper release API methods
          newItem = null;
          break;

        case 'tests':
          // TODO: Implement proper test case API methods
          newItem = null;
          break;

        default:
          throw new Error(`Unsupported kanban type: ${type}`);
      }

      return newItem ? transformToKanbanCard(newItem, type) : null;
    } catch (error) {
      console.error(`Error creating ${type} item:`, error);
      return null;
    }
  },

  // Update item
  async updateItem(type: KanbanType, itemId: number, data: KanbanItemUpdateRequest): Promise<KanbanCard | null> {
    try {
      let updatedItem: any;

      switch (type) {
        case 'projects':
          updatedItem = await projectDAO.updateProject(itemId, {
            name: data.title,
            description: data.description,
            status: data.status,
          });
          break;

        case 'requirements':
          updatedItem = await requirementDAO.updateRequirement(itemId, {
            title: data.title,
            description: data.description,
            progress: data.progress,
          });
          break;

        case 'releases':
          // TODO: Implement proper release API methods
          updatedItem = null;
          break;

        case 'tests':
          // TODO: Implement proper test case API methods
          updatedItem = null;
          break;

        default:
          throw new Error(`Unsupported kanban type: ${type}`);
      }

      return updatedItem ? transformToKanbanCard(updatedItem, type) : null;
    } catch (error) {
      console.error(`Error updating ${type} item:`, error);
      return null;
    }
  },

  // Delete item
  async deleteItem(type: KanbanType, itemId: number): Promise<boolean> {
    try {
      switch (type) {
        case 'projects':
          await projectDAO.deleteProject(itemId);
          break;

        case 'requirements':
          await requirementDAO.deleteRequirement(itemId);
          break;

        case 'releases':
          // TODO: Implement proper release API methods
          break;

        case 'tests':
          // TODO: Implement proper test case API methods
          break;

        default:
          throw new Error(`Unsupported kanban type: ${type}`);
      }

      return true;
    } catch (error) {
      console.error(`Error deleting ${type} item:`, error);
      return false;
    }
  },

  // Get single item
  async getItem(type: KanbanType, itemId: number): Promise<KanbanCard | null> {
    try {
      let item: any;

      switch (type) {
        case 'projects':
          const projectResponse = await projectDAO.getProjectById(itemId);
          item = projectResponse.project;
          break;

        case 'requirements':
          const requirementResponse = await requirementDAO.getRequirementById(itemId);
          item = requirementResponse; // RequirementDetailResponse extends RequirementWithDetails
          break;

        case 'releases':
          // TODO: Implement proper release API methods
          item = null;
          break;

        case 'tests':
          // TODO: Implement proper test case API methods
          item = null;
          break;

        default:
          throw new Error(`Unsupported kanban type: ${type}`);
      }

      return item ? transformToKanbanCard(item, type) : null;
    } catch (error) {
      console.error(`Error loading ${type} item:`, error);
      return null;
    }
  },
}; 