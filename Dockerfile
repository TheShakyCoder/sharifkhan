# BUILD STAGE
FROM oven/bun:alpine AS build
WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./
RUN bun install

# Copy source files
COPY . .
RUN bun run build

# PRODUCTION STAGE
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
