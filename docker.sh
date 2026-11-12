#!/usr/bin/env bash
# Chạy frontend bằng Docker. Dùng: ./docker.sh [up|down|restart|logs|status]  (mặc định: up)
# Đổi cổng: PORT=8080 ./docker.sh up
set -euo pipefail
cd "$(dirname "$0")"

case "${1:-up}" in
  up)      docker compose up --build -d && echo "Đang chạy: http://localhost:${PORT:-3000}  (xem log: ./docker.sh logs)" ;;
  down)    docker compose down ;;
  restart) docker compose down && "$0" up ;;
  logs)    docker compose logs -f frontend ;;
  status)  docker compose ps ;;
  *)       echo "Dùng: $0 [up|down|restart|logs|status]" >&2; exit 1 ;;
esac
