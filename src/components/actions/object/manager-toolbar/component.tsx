"use client";

import { Button, Group, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { ObjectEditorForm } from "@/components/forms/object/editor/component";
import { createClient } from "@/shared/api/supabase/client";

export function ObjectManagerToolbar({
  object,
}: {
  object?: { id: string; name: string; address: string };
}) {
  const [opened, { open, close }] = useDisclosure(false);
  const router = useRouter();

  async function onDelete() {
    if (!object) return;
    if (!confirm(`Удалить объект «${object.name}» и все его задачи?`)) return;

    const supabase = createClient();
    const { error } = await supabase.from("objects").delete().eq("id", object.id);
    if (error) {
      notifications.show({ color: "red", message: error.message });
      return;
    }
    notifications.show({ color: "teal", message: "Объект удалён" });
    router.push("/objects");
    router.refresh();
  }

  return (
    <>
      <Group>
        <Button onClick={open}>{object ? "Редактировать" : "Новый объект"}</Button>
        {object ? (
          <Button color="red" variant="light" onClick={onDelete}>
            Удалить
          </Button>
        ) : null}
      </Group>

      <Modal
        opened={opened}
        onClose={close}
        title={object ? "Редактирование объекта" : "Новый объект"}
      >
        <ObjectEditorForm initial={object} onDone={close} />
      </Modal>
    </>
  );
}
