#!/usr/bin/env bash
# Chạy frontend, backend và Postgres bằng Docker. Dùng: ./docker.sh [up|dev|down|restart|logs [frontend|backend|db]|status]  (mặc định: up)
# dev: sửa code là trang và API tự cập nhật. up: bản production giống lúc deploy.
# Đổi cổng: PORT=8080 ./docker.sh up · BACKEND_PORT=4100 DB_PORT=5433 ./docker.sh dev
set -euo pipefail
cd "$(dirname "$0")"

[ -f .env ] || { cp .env.example .env && echo "Đã tạo .env từ .env.example (đổi POSTGRES_PASSWORD trước khi deploy thật)."; }

running_file() { docker ps -q -f name='special-education-.*-dev' | grep -q . && echo docker-compose.dev.yml || echo docker-compose.yml; }

case "${1:-up}" in
  up)      docker compose -f docker-compose.dev.yml down 2>/dev/null || true; docker compose up --build -d && echo "Đang chạy: http://localhost:${PORT:-3000}  (xem log: ./docker.sh logs)" ;;
  dev)     docker compose down 2>/dev/null || true; docker compose -f docker-compose.dev.yml up -d && echo "Dev đang chạy: http://localhost:${PORT:-3000}, API http://localhost:${BACKEND_PORT:-4000}/api/v1/docs  (lần đầu cài package mất 1-2 phút; xem log: ./docker.sh logs)" ;;
  down)    docker compose down; docker compose -f docker-compose.dev.yml down ;;
  restart) docker compose down && "$0" up ;;
  logs)    docker compose -f "$(running_file)" logs -f ${2:-} ;;
  status)  docker ps -a -f name=special-education- ;;
  *)       echo "Dùng: $0 [up|dev|down|restart|logs [frontend|backend|db]|status]" >&2; exit 1 ;;
esac
