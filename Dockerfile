FROM node:22-alpine AS base

# ─── Backend build ────────────────────────────────────────────
FROM base AS backend-build
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm ci
COPY backend ./backend/
RUN cd backend && npx tsc

# ─── Frontend build ──────────────────────────────────────────
FROM base AS frontend-build
WORKDIR /app
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci
COPY frontend ./frontend/
RUN cd frontend && npm run build

# ─── Production ──────────────────────────────────────────────
FROM base AS production
WORKDIR /app

ENV NODE_ENV=production

# Backend
COPY --from=backend-build /app/backend/dist ./backend/dist/
COPY --from=backend-build /app/backend/package*.json ./backend/
COPY backend/src/db ./backend/src/db/
RUN cd backend && npm ci --omit=dev

# Frontend static files
COPY --from=frontend-build /app/frontend/dist ./frontend/dist/

# Uploads directory
RUN mkdir -p /app/backend/uploads

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/health || exit 1

CMD ["node", "backend/dist/server.js"]
