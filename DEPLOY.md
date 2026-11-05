# Деплой на Render — чеклист

1. [ ] Код в GitHub (открытый или доступ для проверяющих).
2. [ ] В Render: Blueprint из `render.yaml` **или** Web Service вручную.
3. [ ] Env на Render (Build + Runtime):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. [ ] **Не** добавлять `SUPABASE_SERVICE_ROLE_KEY` / `sb_secret_*` на Render.
5. [ ] Deploy успешен, открывается `/login`.
6. [ ] Supabase → Auth → Site URL + Redirect URLs = URL Render.
7. [ ] Signup выключен в Supabase Auth.
8. [ ] Проверка: вход `manager@crm.test` / `Manager123!`, доска и объекты видны.

Build: `npm ci && npm run build`  
Start: `npm start` (`next start -H 0.0.0.0`, порт берётся из `PORT` Render)  
Health: `/login`
