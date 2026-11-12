#!/usr/bin/env bash
# Chạy frontend bằng Docker. Dùng: ./docker.sh [up|dev|down|restart|logs|status]  (mặc định: up)
# dev: sửa code là trang tự cập nhật (pnpm dev). up: bản production giống lúc deploy.
# Đổi cổng: PORT=8080 ./docker.sh up
set -euo pipefail
cd "$(dirname "$0")"

case "${1:-up}" in
  up)      docker compose -f docker-compose.dev.yml down 2>/dev/null; docker compose up --build -d && echo "Đang chạy: http://localhost:${PORT:-3000}  (xem log: ./docker.sh logs)" ;;
  dev)     docker compose down 2>/dev/null; docker compose -f docker-compose.dev.yml up -d && echo "Dev đang chạy: http://localhost:${PORT:-3000}  (lần đầu cài package mất 1-2 phút; xem log: ./docker.sh logs)" ;;
  down)    docker compose down; docker compose -f docker-compose.dev.yml down ;;
  restart) docker compose down && "$0" up ;;
  logs)    docker logs -f "$(docker ps -q -f name=special-education-frontend | head -1)" ;;
  status)  docker ps -a -f name=special-education-frontend ;;
  *)       echo "Dùng: $0 [up|dev|down|restart|logs|status]" >&2; exit 1 ;;
esac
