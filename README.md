# Журнал работ

Full-stack приложение для учёта выполненных строительных работ: список записей с фильтрацией и сортировкой, CRUD-операции, справочник видов работ.

## Стек

| Слой | Технология | Почему |
|------|------------|--------|
| Frontend | React 19 + TypeScript + Vite | Требование ТЗ; быстрая разработка и сборка |
| UI | shadcn/ui + Tailwind CSS 4 | Готовые компоненты таблицы, формы, диалогов |
| API-клиент | TanStack Query | Кэширование и автоматический refetch после мутаций |
| Backend | Node.js + Express + TypeScript | Простой REST API в одной экосистеме с React |
| ORM | Prisma | Миграции, seed справочника, типобезопасность |
| БД | PostgreSQL 16 | Надёжное хранение данных |
| Запуск | Docker Compose | Одна команда для БД, API и UI |

## Требования

**Вариант A (рекомендуется):** [Docker Desktop](https://www.docker.com/products/docker-desktop/) для Windows  
**Вариант B:** Node.js 20+ и [PostgreSQL](https://www.postgresql.org/download/windows/) 16+

## Ошибка «docker is not recognized»

Команда `docker` не найдена — **Docker не установлен** или не добавлен в PATH.

1. Установите [Docker Desktop для Windows](https://docs.docker.com/desktop/setup/install/windows-install/)
2. Перезапустите PowerShell (или компьютер)
3. Проверьте: `docker --version`
4. Запустите проект:

```powershell
cd "C:\Users\Honor\Desktop\Буся"
docker compose up --build
```

Если появляется ошибка `project name must not be empty` (папка с кириллицей в пути), в `docker-compose.yml` уже задано имя `work-journal`. Либо явно: `docker compose -p work-journal up --build`

Если Docker ставить не хотите — см. раздел **«Запуск без Docker (Windows)»** ниже.

## Быстрый запуск (Docker)

```powershell
docker compose up --build
```

После запуска:

- **UI:** http://localhost:5173
- **API:** http://localhost:3001/api/health

## Запуск без Docker (Windows)

### Шаг 1. PostgreSQL

Установите PostgreSQL и при установке запомните пароль пользователя `postgres`.  
Создайте базу `work_journal` (через pgAdmin или SQL):

```sql
CREATE DATABASE work_journal;
```

Отредактируйте [`backend/.env`](backend/.env) — укажите свой пароль:

```
DATABASE_URL=postgresql://postgres:ВАШ_ПАРОЛЬ@localhost:5432/work_journal
```

### Шаг 2. Подготовка БД

```powershell
cd "C:\Users\Honor\Desktop\Буся"
.\scripts\setup-db.ps1
```

### Шаг 3. Запуск приложения

```powershell
.\scripts\start-dev.ps1
```

Откройте http://localhost:5173

## Локальная разработка (без Docker)

### 1. База данных

Запустите PostgreSQL и создайте БД `work_journal`, либо используйте только контейнер БД:

```bash
docker-compose up db
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Backend будет доступен на http://localhost:3001

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend будет доступен на http://localhost:5173 (прокси `/api` → backend).

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
├── backend/          # Express + Prisma API
└── frontend/         # React + Vite UI
```
