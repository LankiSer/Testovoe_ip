"use client";

import { Button, Paper, PasswordInput, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/shared/api/supabase/client";

export function AuthLoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: (v) => (/^\S+@\S+$/.test(v) ? null : "Введите email"),
      password: (v) => (v.length >= 6 ? null : "Минимум 6 символов"),
    },
  });

  async function onSubmit(values: typeof form.values) {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(values);
    setLoading(false);

    if (error) {
      notifications.show({
        color: "red",
        title: "Не удалось войти",
        message: error.message,
      });
      return;
    }

    router.replace("/objects");
    router.refresh();
  }

  return (
    <Paper shadow="sm" p="xl" radius="md" withBorder maw={420} w="100%">
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack>
          <Title order={3}>Вход</Title>
          <TextInput
            label="Email"
            placeholder="you@company.com"
            {...form.getInputProps("email")}
          />
          <PasswordInput
            label="Пароль"
            {...form.getInputProps("password")}
          />
          <Button type="submit" loading={loading}>
            Войти
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
