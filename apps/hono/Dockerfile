FROM oven/bun:latest as base
WORKDIR /app

# --- Development stage ---
FROM base as dev-stage
EXPOSE 6499
CMD ["bun", "run", "dev"]

# --- CICD stage for Composer dependencies ---
FROM base AS cicd-stage
# install lcov for code coverage
RUN apt update && apt install -y lcov

# --- Build stage (for production) ---
FROM base as build
RUN bun run build

# --- Production stage ---
FROM alpine as prod-stage
WORKDIR /app
RUN apk add --no-cache libstdc++ libgcc
COPY --from=build /app/web ./web
EXPOSE 3000
CMD ["./web"]
