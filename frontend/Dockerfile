FROM node:22-alpine
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
ARG BACKEND_URL=http://backend:4000
ENV BACKEND_URL=$BACKEND_URL
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
