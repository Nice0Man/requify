# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Requify Frontend

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
