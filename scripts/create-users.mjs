import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const i = trimmed.indexOf("=");
      if (i === -1) continue;
      const key = trimmed.slice(0, i);
      const value = trimmed.slice(i + 1);
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // ignore
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const users = [
  {
    email: "manager@crm.test",
    password: "Manager123!",
    role: "manager",
    full_name: "Ирина Постановщик",
  },
  {
    email: "executor1@crm.test",
    password: "Executor123!",
    role: "executor",
    full_name: "Алексей Исполнитель",
  },
  {
    email: "executor2@crm.test",
    password: "Executor123!",
    role: "executor",
    full_name: "Мария Исполнитель",
  },
];

for (const u of users) {
  const { data, error } = await admin.auth.admin.createUser({
    email: u.email,
    password: u.password,
    email_confirm: true,
    app_metadata: { role: u.role },
    user_metadata: { full_name: u.full_name },
  });

  if (error) {
    console.log("ERR", u.email, error.message);
    continue;
  }

  // Триггер может успеть до app_metadata — фиксируем роль явно.
  const { error: profileError } = await admin
    .from("profiles")
    .update({ role: u.role, full_name: u.full_name, email: u.email })
    .eq("id", data.user.id);

  if (profileError) {
    console.log("PROFILE ERR", u.email, profileError.message);
  } else {
    console.log("OK", u.email, data.user.id, u.role);
  }
}
