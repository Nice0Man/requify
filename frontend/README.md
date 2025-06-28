# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Requify Frontend

Modern React TypeScript frontend for the Requify Requirements Management System, built with Feature-Driven Design (FDD) architecture.

## 🏗️ Architecture Overview

The frontend is completely restructured following **Feature-Driven Design (FDD)** principles, providing:

- **Scalable modular architecture** organized by business features
- **Complete TypeScript integration** with backend API contracts
- **Modern React patterns** with hooks, context, and functional components
- **Enterprise-grade authentication** with JWT tokens and permissions
- **Comprehensive design system** with Material-UI components
- **Optimized build process** with code splitting and lazy loading

## 📁 Project Structure

```
src/
├── features/                    # Feature-driven modules
│   ├── auth/                   # Authentication & authorization
│   │   ├── api/               # Auth API services
│   │   ├── context/           # Auth React context
│   │   ├── pages/             # Login, Profile pages
│   │   └── types/             # Auth TypeScript types
│   ├── projects/              # Project management
│   │   ├── api/               # Projects API services
│   │   ├── pages/             # Project pages
│   │   └── types/             # Project types
│   ├── requirements/          # Requirements management
│   │   ├── api/               # Requirements API services
│   │   ├── pages/             # Requirements pages
│   │   └── types/             # Requirements types
│   ├── testing/               # Test management
│   │   ├── api/               # Testing API services
│   │   ├── pages/             # Testing pages
│   │   └── types/             # Testing types
│   ├── releases/              # Release management
│   │   ├── api/               # Releases API services
│   │   ├── pages/             # Release pages
│   │   └── types/             # Release types
│   ├── admin/                 # System administration
│   │   ├── api/               # Admin API services
│   │   ├── pages/             # Admin pages
│   │   └── types/             # Admin types
│   └── dashboard/             # Dashboard overview
│       └── pages/             # Dashboard page
├── shared/                     # Shared infrastructure
│   ├── api/                   # API client & interceptors
│   ├── components/            # Reusable UI components
│   │   ├── Layout/           # Main application layout
│   │   └── PrivateRoute/     # Route protection
│   ├── hooks/                 # Custom React hooks
│   ├── pages/                 # Common pages (404, etc.)
│   ├── styles/                # Design system & themes
│   └── types/                 # Common TypeScript types
└── App.tsx                    # Main application component
```

## 🚀 Key Features

### 🔐 Authentication System
- **JWT-based authentication** with automatic token refresh
- **Role-based access control** (Admin, Manager, Analyst, Tester, User)
- **Permission-based routing** with granular access control
- **Session management** with multiple session support
- **Secure password handling** with reset functionality

### 🏢 Feature Modules

#### **Projects Management**
- Complete project lifecycle management
- Team member assignment and role management
- Project statistics and progress tracking
- Advanced filtering and search capabilities

#### **Requirements Management**
- Full CRUD operations for requirements
- Hierarchical requirement organization with groups
- Requirement relationships and dependencies
- Status tracking and approval workflows
- Tagging and categorization system
- Import/export functionality
- Comment and history tracking

#### **Testing Management**
- Test case creation and management
- Test suite organization
- Test run execution and reporting
- Defect tracking and management
- Test plan creation and approval
- Comprehensive test metrics and analytics

#### **Release Management**
- Release planning and version control
- Deployment tracking across environments
- Change log management
- Approval workflows
- Artifact management
- Release metrics and analytics

#### **System Administration**
- User management with role assignment
- System monitoring and health checks
- Activity logging and audit trails
- Security event tracking
- System settings configuration
- Backup management
- Integration management

## 🛠️ Technical Stack

### **Core Technologies**
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Full type safety and better developer experience
- **Material-UI (MUI)** - Enterprise-grade component library
- **React Router v6** - Modern routing with nested routes
- **React Hook Form** - Performant form handling
- **Yup** - Schema validation

### **State Management**
- **React Context** - For global authentication state
- **useReducer** - For complex state logic
- **Local State** - For component-specific state
- **React Query** - For server state management (configured)

### **Build & Development**
- **Vite** - Fast build tool with HMR
- **ESLint** - Code linting and formatting
- **TypeScript** - Static type checking
- **Path Aliases** - Clean import statements (`@/`, `@/features/`, `@/shared/`)

## 🎨 Design System

### **Theme Configuration**
- Comprehensive color palette with semantic colors
- Typography system with Inter font family
- Consistent spacing and layout tokens
- Component-specific design tokens
- Dark/light theme support (configured)

### **Component Architecture**
- Atomic design principles
- Reusable component library
- Consistent styling patterns
- Responsive design support

## 🔧 API Integration

### **Modern API Client**
- Axios-based HTTP client with interceptors
- Automatic token refresh handling
- Comprehensive error handling and typing
- File upload/download capabilities
- Request/response transformations

### **Type-Safe API Contracts**
All API services are fully typed based on backend contracts:
- Complete CRUD operations for all entities
- Advanced filtering and pagination
- File operations (upload/download)
- Bulk operations
- Search functionality

## 🚦 Routing & Navigation

### **Route Structure**
```
/login                          # Public login page
/dashboard                      # Main dashboard
/projects                       # Projects list
/projects/:id                   # Project details
/requirements                   # Requirements list
/requirements/:id               # Requirement details
/testing                        # Testing overview
/testing/runs/:id               # Test run details
/releases                       # Releases list
/releases/:id                   # Release details
/admin/*                        # Admin section (protected)
/profile                        # User profile
```

### **Route Protection**
- **Private routes** require authentication
- **Permission-based routes** check user permissions
- **Automatic redirects** for unauthorized access
- **Loading states** during authentication checks

## 📱 User Experience

### **Modern UI/UX**
- **Responsive design** works on desktop, tablet, and mobile
- **Intuitive navigation** with persistent sidebar
- **Loading states** and error handling
- **Toast notifications** for user feedback
- **Search and filtering** across all data tables
- **Bulk operations** for efficiency

### **Performance Optimizations**
- **Code splitting** by feature modules
- **Lazy loading** of route components
- **Image optimization** and asset management
- **Bundle analysis** and optimization

## 🛡️ Security Features

### **Frontend Security**
- **XSS protection** with React's built-in protections
- **CSRF protection** via API tokens
- **Secure token storage** with automatic cleanup
- **Permission validation** on every route
- **Input validation** with Yup schemas

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ and npm
- Backend API running on port 8000

### **Installation**
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run type checking
npm run type-check

# Run linting
npm run lint
```

### **Environment Setup**
The application is configured to proxy API requests to `http://localhost:8000` during development.

## 🔄 Migration from Old Architecture

This restructuring represents a complete modernization from the previous Redux-based architecture to a modern FDD approach:

### **What Changed**
- ✅ **Redux → React Context + useReducer** for simpler state management
- ✅ **Feature-based organization** instead of technical layers
- ✅ **Full TypeScript integration** with backend API contracts
- ✅ **Modern routing patterns** with nested routes and lazy loading
- ✅ **Component-based architecture** with reusable design system
- ✅ **Enhanced developer experience** with path aliases and tooling

### **Benefits**
- 🚀 **Better scalability** - Features are self-contained and independent
- 🛠️ **Improved maintainability** - Clear separation of concerns
- 🔧 **Enhanced developer experience** - Better tooling and type safety
- 📈 **Performance improvements** - Code splitting and lazy loading
- 🎯 **Type safety** - Full TypeScript integration prevents runtime errors

## 📚 Development Guidelines

### **Adding New Features**
1. Create feature directory under `src/features/`
2. Implement types, API services, and pages
3. Add routes to main App component
4. Update navigation if needed

### **Code Standards**
- Use TypeScript for all new code
- Follow React hooks patterns
- Implement proper error handling
- Add loading states for async operations
- Use consistent naming conventions

### **Component Development**
- Create reusable components in `shared/components/`
- Use Material-UI components and theming
- Implement responsive design
- Add proper TypeScript types

## 🔮 Future Enhancements

The current implementation provides a solid foundation for future development:

- **Real-time updates** with WebSocket integration
- **Advanced data visualization** with charts and graphs
- **Offline support** with service workers
- **Mobile app** with React Native code sharing
- **Advanced search** with full-text search capabilities
- **Workflow automation** with custom business rules

---

This frontend architecture is designed to scale with your organization's needs while maintaining excellent developer experience and user satisfaction.

## Docker build & run

1. Соберите образ:

```sh
# В корне проекта
# (замените requify-frontend на нужное имя)
docker build -t requify-frontend .
```

2. Запустите контейнер:

```sh
docker run -d --name requify-frontend -p 3000:3000 requify-frontend
```

Фронтенд будет доступен на http://localhost:3000

---

- В контейнере используется nginx, SPA fallback настроен.
- Для корректной работы с API убедитесь, что переменная окружения VITE_API_URL указывает на backend (можно задать через .env или переменную окружения при build).
