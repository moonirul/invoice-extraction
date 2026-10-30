# ── build ────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Empty API base = same-origin; nginx proxies /api to the backend container.
ARG VITE_API_BASE_URL=
ARG VITE_MAX_UPLOAD_MB=10
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL VITE_MAX_UPLOAD_MB=$VITE_MAX_UPLOAD_MB
RUN npm run build

# ── serve ────────────────────────────────────────────────
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
