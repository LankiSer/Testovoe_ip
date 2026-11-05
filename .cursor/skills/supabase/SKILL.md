---
name: supabase
description: >-
  Schema, RLS, status transitions and migrations for the CRM under supabase/.
  Use with the official Supabase skill when touching Auth/RLS/SQL.
---

# supabase

Rule: `.cursor/rules/supabase/rule.mdc`

## Checklist

```
- [ ] RLS на всех пользовательских таблицах
- [ ] executor не читает/не меняет чужие задачи
- [ ] переходы статусов только по таблице ТЗ, проверка в БД
- [ ] history immutable для клиента
- [ ] signup выключен
- [ ] service_role не в репозитории и не в NEXT_PUBLIC_*
```
