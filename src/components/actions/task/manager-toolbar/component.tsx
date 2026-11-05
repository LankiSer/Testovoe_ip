"use client";

import { Button, Group, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { TaskEditorForm } from "@/components/forms/task/editor/component";
import { createClient } from "@/shared/api/supabase/client";

type Option = { value: string; label: string };

export function TaskManagerToolbar({
  objectId,
  objects,
  assignees,
  task,
}: {
  objectId?: string;
  objects?: Option[];
  assignees: Option[];
  task?: {
    id: string;
    title: string;
    description: string;
    assignee_id: string | null;
    object_id?: string | null;
  };
}) {
  const [opened, { open, close }] = useDisclosure(false);
  const router = useRouter();

  async function onDelete() {
    if (!task) return;
    if (!confirm(`Удалить задачу «${task.title}»?`)) return;

    const supabase = createClient();
    const { error } = await supabase.from("tasks").delete().eq("id", task.id);
    if (error) {
      notifications.show({ color: "red", message: error.message });
      return;
    }
    notifications.show({ color: "blue", message: "Задача удалена" });
    router.push(objectId ? `/objects/${objectId}` : "/board");
    router.refresh();
  }

  return (
    <>
      <Group>
        <Button onClick={open}>{task ? "Редактировать" : "Новая задача"}</Button>
        {task ? (
          <Button color="red" variant="light" onClick={onDelete}>
            Удалить
          </Button>
        ) : null}
      </Group>

      <Modal
        opened={opened}
        onClose={close}
        title={task ? "Редактирование задачи" : "Новая задача"}
        size="md"
      >
        <TaskEditorForm
          objectId={objectId}
          objects={objects}
          assignees={assignees}
          initial={task}
          onDone={close}
        />
      </Modal>
    </>
  );
}
