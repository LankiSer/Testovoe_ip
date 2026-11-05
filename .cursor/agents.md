# Мини-CRM «Объекты и задачи»

Документ для AI-агента. Описывает **зачем** устроен проект так.

**Язык:** отвечай пользователю всегда на русском. Код, пути и идентификаторы не переводить.

---

## Стек

Next.js (App Router) · React · TypeScript · Mantine · Tailwind CSS · Supabase (Auth + Postgres + RLS)

UI: [Mantine](https://mantine.dev) — MIT, формы/таблицы/модалки из коробки, удобно для CRM за 2–3 часа.

---

## Домен

| Сущность | Смысл |
| -------- | ----- |
| **Роль** | `manager` (постановщик) / `executor` (исполнитель) |
| **Объект** | стройка: название, адрес |
| **Задача** | по объекту: название, описание, исполнитель, статус, автор |
| **История** | смена статуса: кто, когда, from→to, комментарий |

Статусы: `new` → `in_progress` → `review` → `accepted` \| `rework` → `in_progress`.

Безопасность: RLS + DB-ограничения на переходы. История только insert через триггер/функцию, без update/delete для клиента. `service_role` не во фронте и не в репозитории.

---

## DDD — слои

```
src/
├── app/              маршруты Next.js
├── components/       UI-блоки продукта
├── common/           formatters, helpers без привязки к экрану
├── config/           providers, theme, env
└── shared/           Supabase-клиент, API-сервисы домена
```

| Слой | Роль | Пример |
| ---- | ---- | ------ |
| **Routes** (`app`) | страницы, layouts, route groups | `(auth)/login`, `(cabinet)/objects` |
| **Components** | карточки, формы, списки | `components/display/task/card` |
| **Cross-cutting** (`common`) | даты, статусы → лейблы | `DateFormatUtility` |
| **Infrastructure** (`shared`) | Supabase + сервисы | `TasksReadService` |
| **Config** | MantineProvider, клиент env | `config/providers` |

### Правила

1. **Маршрут = папка** в `app/`. Группы `()` не в URL. Params — `[]`.
2. **Page** — композиция; данные — через `*Service.index`; UI — Mantine + свои компоненты.
3. **Service** — класс `{Domain}{Action}Service`, публичный метод `index`.
4. **Constant** — `{Domain}{Name}Constant`. **Utility** — `{Domain}{Action}Utility` со `static index`.
5. Импорты только через `@/`. Relative запрещены.
6. Права не дублировать «только в UI»: UI скрывает кнопки, база (RLS/функции) — источник истины.

---

## Структура `.cursor/`

```
.cursor/
├── agents.md
├── rules/
│   ├── (architecture)/rule.mdc
│   ├── (ui)/rule.mdc
│   ├── app/[route]/
│   ├── common/rule.mdc
│   ├── shared/rule.mdc
│   └── supabase/rule.mdc
└── skills/
```

## Эталоны (после появления кода)

| Задача | Путь |
| ------ | ---- |
| Вход | `src/app/(auth)/login/page.tsx` |
| Объекты | `src/app/(cabinet)/objects/page.tsx` |
| Задача | `src/app/(cabinet)/tasks/[id]/page.tsx` |
| Supabase client | `src/shared/api/supabase/client.ts` |
| Миграции | `supabase/migrations/` |
