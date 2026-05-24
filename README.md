# Журнал работ

Full-stack приложение для учёта выполненных строительных работ на объекте: список записей с фильтрацией и сортировкой, CRUD-операции, справочник видов работ.

**Репозиторий:** https://github.com/scalevillain13/work-journal

## Стек

| Слой | Технология | Почему |
|------|------------|--------|
| Frontend | React 19 + TypeScript + Vite | Требование ТЗ; быстрая разработка и сборка |
| UI | shadcn/ui + Tailwind CSS 4 | Готовые компоненты таблицы, формы, диалогов |
| API-клиент | TanStack Query | Кэширование и автоматический refetch после мутаций |
| Backend | Node.js + Express + TypeScript | Простой REST API в одной экосистеме с React |
| ORM | Prisma | Миграции, seed справочника, типобезопасность |
| БД | PostgreSQL 16 | Надёжное хранение данных |
| Тесты | Vitest + Supertest + Testing Library | Проверка валидации, API и UI без запуска БД |
| Запуск | Docker Compose | Одна команда для БД, API и UI |

## Требования

**Вариант A (рекомендуется):** [Docker Desktop](https://www.docker.com/products/docker-desktop/) для Windows  
**Вариант B:** Node.js 20+ и [PostgreSQL](https://www.postgresql.org/download/windows/) 16+

> Docker Desktop на Windows требует включённую виртуализацию (VT-x/SVM в BIOS) и компоненты WSL2 + Virtual Machine Platform.

## Быстрый запуск (Docker)

```powershell
git clone https://github.com/scalevillain13/work-journal.git
cd work-journal
docker compose up --build
```

Если папка проекта содержит кириллицу и появляется ошибка `project name must not be empty`, используйте явное имя:

```powershell
docker compose -p work-journal up --build
```

После запуска:

- **UI:** http://localhost:5173
- **API:** http://localhost:3001/api/health

## Запуск без Docker (Windows)

### Шаг 1. PostgreSQL

1. Установите PostgreSQL и запомните пароль пользователя `postgres`
2. Создайте базу `work_journal` (через pgAdmin или SQL Shell):

```sql
CREATE DATABASE work_journal;
```

3. Скопируйте и настройте переменные окружения:

```powershell
copy backend\.env.example backend\.env
```

В [`backend/.env`](backend/.env) укажите свой пароль:

```env
DATABASE_URL=postgresql://postgres:ВАШ_ПАРОЛЬ@localhost:5432/work_journal
PORT=3001
```

### Шаг 2. Подготовка БД

```powershell
cd work-journal
.\scripts\setup-db.ps1
```

### Шаг 3. Запуск приложения

```powershell
.\scripts\start-dev.ps1
```

Откройте http://localhost:5173

## Локальная разработка (без Docker)

### 1. База данных

Запустите PostgreSQL и создайте БД `work_journal`, либо поднимите только контейнер БД:

```powershell
docker compose -f docker-compose.db.yml up -d
```

### 2. Backend

```powershell
cd backend
copy .env.example .env
npm install
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Backend: http://localhost:3001

### 3. Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173 (прокси `/api` → backend)

## Тесты

Автотесты не требуют PostgreSQL: API проверяется через Supertest с mock Prisma, UI — через Vitest + Testing Library.

```powershell
# все тесты
npm test

# только backend
npm run test:backend

# только frontend
npm run test:frontend
```

Что покрыто:

- валидация полей записи (backend)
- REST API: health, справочник, CRUD записей (backend)
- обработка ошибок API-клиента (frontend)
- форма добавления записи и её валидация (frontend)

## API

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/work-types` | Список видов работ |
| GET | `/api/entries?dateFrom=&dateTo=&sort=date&order=asc\|desc` | Список записей |
| GET | `/api/entries/:id` | Одна запись |
| POST | `/api/entries` | Создание записи |
| PUT | `/api/entries/:id` | Редактирование |
| DELETE | `/api/entries/:id` | Удаление |

### Пример тела запроса (POST/PUT)

```json
{
  "performedAt": "2025-05-24",
  "workTypeId": 1,
  "volume": 24,
  "executorName": "Иванов Иван Иванович"
}
```

## Структура проекта

```
├── docker-compose.yml
├── docker-compose.db.yml
├── scripts/
│   ├── setup-db.ps1
│   └── start-dev.ps1
├── backend/          # Express + Prisma API
└── frontend/         # React + Vite UI
```

## Ошибка «docker is not recognized»

Команда `docker` не найдена — Docker не установлен или не добавлен в PATH.

1. Установите [Docker Desktop для Windows](https://docs.docker.com/desktop/setup/install/windows-install/)
2. Перезапустите PowerShell
3. Проверьте: `docker --version`
4. Запустите: `docker compose up --build`

Если Docker ставить не хотите — используйте раздел **«Запуск без Docker (Windows)»** выше.
