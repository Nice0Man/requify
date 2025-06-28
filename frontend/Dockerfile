<<<<<<< HEAD
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY vite.config.js ./
COPY .eslintrc* ./
COPY ./src ./src
COPY ./public ./public
RUN npm ci && npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/public /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/nginx.conf
EXPOSE 3000
=======
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY vite.config.js ./
COPY .eslintrc* ./
COPY ./src ./src
COPY ./public ./public
RUN npm ci && npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/public /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/nginx.conf
EXPOSE 3000
>>>>>>> 856f3abcb1f3a1051ee1646825a2a80d24c1aa64
CMD ["nginx", "-g", "daemon off;"] 