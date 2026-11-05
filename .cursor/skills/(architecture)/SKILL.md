---
name: architecture
description: >-
  Applies global naming, folder patterns (. ( ) [ ]), Next.js + Mantine + Supabase
  structure when creating artifacts in src/.
---

# (architecture)

Rule: `.cursor/rules/(architecture)/rule.mdc`

## Checklist

```
- [ ] Ответы на русском. Код и пути не переводить
- [ ] Папки: ( ) группа, [ ] param
- [ ] Страницы в app/, данные в shared/api, контролы в components/{cat}/{name}/
- [ ] Mantine из @mantine/*, тема через provider
- [ ] Service/Utility — метод index
- [ ] Constant — плоский {Name}Constant
- [ ] Секреты service_role не во фронте; права через RLS
```
