"use client";

import { Button, Group, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/shared/api/supabase/client";

export function ObjectEditorForm({
  initial,
  onDone,
}: {
  initial?: { id: string; name: string; address: string };
  onDone?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const form = useForm({
    initialValues: {
      name: initial?.name ?? "",
      address: initial?.address ?? "",
    },
    validate: {
      name: (v) => (v.trim() ? null : "Укажите название"),
      address: (v) => (v.trim() ? null : "Укажите адрес"),
    },
  });

  async function onSubmit(values: typeof form.values) {
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      notifications.show({ color: "red", message: "Сессия истекла" });
      return;
    }

    const payload = {
      name: values.name.trim(),
      address: values.address.trim(),
    };

    const result = initial
      ? await supabase.from("objects").update(payload).eq("id", initial.id)
      : await supabase
          .from("objects")
          .insert({ ...payload, created_by: user.id })
          .select("id")
          .single();

    setLoading(false);

    if (result.error) {
      notifications.show({
        color: "red",
        title: "Ошибка",
        message: result.error.message,
      });
      return;
    }

    notifications.show({
      color: "teal",
      message: initial ? "Объект обновлён" : "Объект создан",
    });
    onDone?.();
    router.refresh();
    if (!initial && "data" in result && result.data?.id) {
      router.push(`/objects/${result.data.id}`);
    }
  }

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack>
        <TextInput label="Название" {...form.getInputProps("name")} />
        <TextInput label="Адрес" {...form.getInputProps("address")} />
        <Group justify="flex-end">
          <Button type="submit" loading={loading}>
            {initial ? "Сохранить" : "Создать"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
