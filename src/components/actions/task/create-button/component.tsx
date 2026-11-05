"use client";

import { Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { TaskEditorForm } from "@/components/forms/task/editor/component";

type Option = { value: string; label: string };

export function TaskCreateButton({
  objectId,
  objects,
  assignees,
  label = "Новая задача",
}: {
  objectId?: string;
  objects?: Option[];
  assignees: Option[];
  label?: string;
}) {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button onClick={open}>{label}</Button>
      <Modal opened={opened} onClose={close} title="Новая задача" size="md">
        <TaskEditorForm
          objectId={objectId}
          objects={objects}
          assignees={assignees}
          onDone={close}
        />
      </Modal>
    </>
  );
}
