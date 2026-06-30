# Hướng dẫn chạy dự án

## Yêu cầu

- [Node.js 22+](https://nodejs.org) và [pnpm](https://pnpm.io) — để chạy dev local
- [Docker Desktop](https://www.docker.com/products/docker-desktop) — để chạy bằng Docker

---

## 1. Chạy development (local)

```bash
cd frontend
pnpm install
pnpm dev
```

Truy cập: http://localhost:3000

---

## 2. Chạy bằng Docker

### Build và chạy một lệnh

```bash
docker compose up --build
```

### Chạy nền (background)

```bash
docker compose up --build -d
```

### Dừng

```bash
docker compose down
```

Truy cập: http://localhost:3000

---

## 3. Chạy Docker thủ công (không dùng compose)

```bash
# Build image
docker build -t special-education-frontend ./frontend

# Chạy container
docker run -p 3000:3000 special-education-frontend
```

---

## Cấu trúc thư mục

```
special-education/
├── frontend/          # Next.js app
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```
