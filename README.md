# Мини-CRM «Объекты и задачи»

React + TypeScript (Next.js App Router) + Supabase + Mantine.

Постановщик управляет объектами и задачами, исполнитель видит только свои задачи и объекты с ними, двигает статусы по разрешённым переходам. Права и переходы закрыты **RLS и SQL-функцией** `transition_task`, а не только UI.

## Стек

- Next.js 16, React 19, TypeScript
- Supabase Auth + Postgres + RLS
- Mantine UI
- Деплой: [Render](https://render.com) (Web Service)

## Быстрый старт (локально)

1. Скопируйте `.env.example` → `.env.local` и заполните:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

`SUPABASE_SERVICE_ROLE_KEY` / `sb_secret_*` **не** кладите в `NEXT_PUBLIC_*` и не коммитьте.

2. Установите зависимости и запустите:

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Деплой на Render

В репозитории есть `render.yaml` (Blueprint).

### Вариант A — Blueprint

1. Запушьте код на GitHub.
2. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint** → выберите репозиторий.
3. При создании сервиса задайте переменные (или после в **Environment**):

| Key | Value |
| --- | ----- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://….supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon / legacy JWT или publishable key |

`NODE_VERSION`, `NODE_ENV` уже в `render.yaml`. Service role на Render **не** нужен.

4. Дождитесь Deploy. URL вида `https://objects-tasks-crm.onrender.com`.

### Вариант B — вручную (Web Service)

| Поле | Значение |
| ---- | -------- |
| Runtime | Node |
| Build Command | `npm ci && npm run build` |
| Start Command | `npm start` |
| Health Check Path | `/login` |

Те же env, что выше. Node: `22.22.0` (файл `.node-version` / `engines` в `package.json`).

### После деплоя — Supabase Auth

В Supabase → **Authentication** → **URL Configuration**:

- **Site URL** — URL приложения на Render
- **Redirect URLs** — добавьте `https://ваш-сервис.onrender.com/**`

Отключите открытую регистрацию: Authentication → Providers / settings → disable sign ups.

На бесплатном плане Render сервис может «засыпать» после простоя — первый запрос после паузы бывает медленным.

## База данных

Миграции в `supabase/migrations/`.

Что делают:

- таблицы `profiles`, `objects`, `tasks`, `task_status_history`
- RLS: исполнитель не читает чужие задачи/лишние объекты
- смена статуса только через RPC `transition_task`
- историю нельзя insert/update/delete клиентом

## Тестовые пользователи

```bash
node scripts/create-users.mjs
```

| Email | Пароль | Роль |
| ----- | ------ | ---- |
| `manager@crm.test` | `Manager123!` | постановщик |
| `executor1@crm.test` | `Executor123!` | исполнитель |
| `executor2@crm.test` | `Executor123!` | исполнитель |

## Экраны

- `/login` — вход
- `/board` — общая доска (канбан)
- `/my-tasks` — задачи, назначенные вам
- `/objects` — список объектов
- `/objects/[id]` — объект и задачи
- `/tasks/[id]` — задача, действия, история

## Безопасность (кратко)

Интерфейс показывает только доступные кнопки. Даже при запросе к Supabase напрямую с anon-ключом:

- чужие задачи исполнителю не отдаст RLS;
- запрещённый переход статуса не пройдёт через `transition_task`;
- подделать историю статусов через API нельзя.
