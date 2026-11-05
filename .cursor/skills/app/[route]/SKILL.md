---
name: app-route
description: Scaffolds Next.js route in src/app/ with page, layout for CRM screens.
---

# app/{route}

Rule: `.cursor/rules/app/[route]/rule.mdc`

## Steps

1. Группа `(auth)` или `(cabinet)` по смыслу.
2. `page.tsx` — композиция. Данные — `*Service.index`.
3. `"use client"` только если нужен стейт, форма или Mantine modal/notifications.
4. Действия на задаче — только разрешённые ролью + статусом.
