# ---------- Build stage ----------
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Runtime stage ----------
FROM node:20-alpine AS production

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /usr/src/app/dist ./dist

# .env will be mounted via docker-compose env_file
EXPOSE 3000

CMD ["node", "dist/main.js"]
# CMD ["node", "dist/src/main.js"]
