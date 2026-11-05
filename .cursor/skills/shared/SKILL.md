---
name: shared
description: Supabase clients and domain services under src/shared/api/{domain}.
---

# shared

Rule: `.cursor/rules/shared/rule.mdc`

1. Browser/server клиенты в `shared/api/supabase/`
2. DTO в `dtos/{action}.ts`
3. Service `{Domain}{Action}Service.index`
4. Смена статуса — через согласованную DB-функцию / RPC, не обход RLS
