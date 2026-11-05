"use client";

import { Button, Group, Select, Stack, TextInput, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/shared/api/supabase/client";

type Option = { value: string; label: string };

export function TaskEditorForm({
  objectId,
  objects,
  assignees,
  initial,
  onDone,
}: {
  objectId?: string;
  objects?: Option[];
  assignees: Option[];
  initial?: {
    id: string;
    title: string;
    description: string;
    assignee_id: string | null;
    object_id?: string | null;
  };
  onDone?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const form = useForm({
    initialValues: {
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      assignee_id: initial?.assignee_id ?? "",
      object_id: objectId ?? initial?.object_id ?? "",
    },
    validate: {
      title: (v) => (v.trim() ? null : "Укажите название"),
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
      title: values.title.trim(),
      description: values.description.trim(),
      assignee_id: values.assignee_id || null,
      object_id: values.object_id || null,
    };

    const result = initial
      ? await supabase.from("tasks").update(payload).eq("id", initial.id)
      : await supabase
          .from("tasks")
          .insert({
            ...payload,
            author_id: user.id,
            status: "new",
          })
          .select("id")
          .single();

    setLoading(false);

    if (result.error) {
      notifications.show({
        color: "red",
        title: "Не удалось сохранить",
        message: result.error.message,
      });
      return;
    }

    notifications.show({
      color: "blue",
      message: initial ? "Задача обновлена" : "Задача создана",
    });
    onDone?.();
    router.refresh();
    if (!initial && "data" in result && result.data?.id) {
      router.push(`/tasks/${result.data.id}`);
    }
  }

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack>
        {!objectId ? (
          <Select
            label="Объект"
            description="Можно оставить пустым"
            placeholder="Без объекта"
            clearable
            searchable
            data={objects ?? []}
            {...form.getInputProps("object_id")}
          />
        ) : null}
        <TextInput label="Название" {...form.getInputProps("title")} />
        <Textarea
          label="Описание"
          minRows={3}
          autosize
          {...form.getInputProps("description")}
        />
        <Select
          label="Исполнитель"
          description="Можно назначить любого сотрудника, включая постановщика"
          placeholder="Назначить позже"
          clearable
          searchable
          data={assignees}
          {...form.getInputProps("assignee_id")}
        />
        <Group justify="flex-end">
          <Button type="submit" loading={loading}>
            {initial ? "Сохранить" : "Создать задачу"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
