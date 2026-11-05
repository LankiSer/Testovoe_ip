"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { TaskBoardColumnsConstant } from "@/common/constants/task-board";
import type { TaskStatus } from "@/common/constants/task-status";
import { TaskTransitionsAvailableUtility } from "@/common/task-transitions/available";
import type { UserRole } from "@/common/constants/user-role";
import { createClient } from "@/shared/api/supabase/client";
import type { TasksReadDto } from "@/shared/api/tasks/dtos/read";

function TaskCard({
  task,
  showObject,
  dragDisabled,
}: {
  task: TasksReadDto;
  showObject: boolean;
  dragDisabled?: boolean;
}) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      data: { task },
      disabled: dragDisabled,
    });

  const style: React.CSSProperties = {
    background: "#fff",
    cursor: dragDisabled ? "pointer" : "grab",
    opacity: isDragging ? 0.4 : 1,
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
  };

  return (
    <Paper
      ref={setNodeRef}
      p="sm"
      radius="md"
      withBorder
      style={style}
      {...listeners}
      {...attributes}
      onDoubleClick={() => router.push(`/tasks/${task.id}`)}
      onClick={(event) => {
        if ((event.target as HTMLElement).closest("[data-no-nav]")) return;
      }}
    >
      <Text
        fw={600}
        size="sm"
        mb={4}
        lineClamp={2}
        style={{ cursor: "pointer" }}
        onClick={() => router.push(`/tasks/${task.id}`)}
      >
        {task.title}
      </Text>
      {showObject ? (
        <Text size="xs" c="dimmed" mb={6} lineClamp={1}>
          {task.objects?.name ?? "Без объекта"}
        </Text>
      ) : null}
      <Text size="xs" c="dimmed">
        {task.assignee?.full_name || task.assignee?.email || "Без исполнителя"}
      </Text>
    </Paper>
  );
}

function KanbanColumn({
  status,
  label,
  accent,
  tasks,
  showObject,
  isOverAllowed,
}: {
  status: TaskStatus;
  label: string;
  accent: string;
  tasks: TasksReadDto[];
  showObject: boolean;
  isOverAllowed: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <Paper
      ref={setNodeRef}
      withBorder
      radius="md"
      p="sm"
      style={{
        width: 300,
        minWidth: 300,
        scrollSnapAlign: "start",
        background: isOver
          ? isOverAllowed
            ? "#eff6ff"
            : "#fef2f2"
          : "#fafafa",
        borderTop: `3px solid ${accent}`,
        transition: "background 120ms ease",
      }}
    >
      <Group justify="space-between" mb="sm">
        <Text fw={600} size="sm">
          {label}
        </Text>
        <Badge color="gray" variant="light" circle>
          {tasks.length}
        </Badge>
      </Group>
      <Stack gap="sm" mih={120}>
        {tasks.length === 0 ? (
          <Text size="xs" c="dimmed" py="md" ta="center">
            Перетащите задачу сюда
          </Text>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} showObject={showObject} />
          ))
        )}
      </Stack>
    </Paper>
  );
}

export function TaskKanban({
  tasks,
  showObject = true,
  role,
  userId,
  emptyHint,
}: {
  tasks: TasksReadDto[];
  showObject?: boolean;
  role: UserRole;
  userId: string;
  emptyHint?: string;
}) {
  const router = useRouter();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState(tasks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overStatus, setOverStatus] = useState<TaskStatus | null>(null);

  useEffect(() => {
    setItems(tasks);
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const activeTask = useMemo(
    () => items.find((task) => task.id === activeId) ?? null,
    [activeId, items],
  );

  const canDropTo = (task: TasksReadDto, to: TaskStatus) =>
    TaskTransitionsAvailableUtility.canMoveTo({
      status: task.status,
      role,
      assigneeId: task.assignee_id,
      userId,
      to,
    });

  async function runTransition(task: TasksReadDto, to: TaskStatus, comment?: string) {
    const supabase = createClient();
    const { error } = await supabase.rpc("transition_task", {
      p_task_id: task.id,
      p_to_status: to,
      p_comment: comment ?? null,
    });

    if (error) {
      notifications.show({
        color: "red",
        title: "Нельзя перенести",
        message: error.message,
      });
      setItems(tasks);
      return;
    }

    setItems((prev) =>
      prev.map((item) => (item.id === task.id ? { ...item, status: to } : item)),
    );
    notifications.show({ color: "blue", message: "Статус обновлён" });
    router.refresh();
  }

  function askCommentAndMove(task: TasksReadDto, to: TaskStatus) {
    let comment = "";
    modals.open({
      title: "Комментарий к доработке",
      children: (
        <Stack>
          <Textarea
            label="Что исправить"
            required
            minRows={3}
            onChange={(event) => {
              comment = event.currentTarget.value;
            }}
          />
          <Button
            onClick={() => {
              if (!comment.trim()) {
                notifications.show({
                  color: "red",
                  message: "Комментарий обязателен",
                });
                return;
              }
              modals.closeAll();
              void runTransition(task, to, comment.trim());
            }}
          >
            Отправить на доработку
          </Button>
        </Stack>
      ),
    });
  }

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function onDragEnd(event: DragEndEvent) {
    const task = items.find((item) => item.id === event.active.id);
    const to = event.over?.id as TaskStatus | undefined;
    setActiveId(null);
    setOverStatus(null);

    if (!task || !to || to === task.status) return;

    if (!canDropTo(task, to)) {
      notifications.show({
        color: "orange",
        message: "Этот переход недоступен для вашей роли или статуса",
      });
      return;
    }

    if (
      TaskTransitionsAvailableUtility.needsComment({
        status: task.status,
        role,
        assigneeId: task.assignee_id,
        userId,
        to,
      })
    ) {
      askCommentAndMove(task, to);
      return;
    }

    void runTransition(task, to);
  }

  function scrollBy(direction: -1 | 1) {
    const node = scrollerRef.current;
    if (!node) return;
    node.scrollBy({ left: direction * 320, behavior: "smooth" });
  }

  if (items.length === 0) {
    return (
      <Paper withBorder p="xl" radius="md" style={{ background: "#fff" }}>
        <Text c="dimmed">{emptyHint ?? "Задач пока нет"}</Text>
      </Paper>
    );
  }

  return (
    <Stack gap="sm">
      <Group justify="space-between">
        <Text size="xs" c="dimmed">
          Перетащите карточку в другой столбец · двойной клик — открыть
        </Text>
        <Group gap={6}>
          <ActionIcon variant="default" onClick={() => scrollBy(-1)} aria-label="Влево">
            ‹
          </ActionIcon>
          <ActionIcon variant="default" onClick={() => scrollBy(1)} aria-label="Вправо">
            ›
          </ActionIcon>
        </Group>
      </Group>

      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragOver={(event) => {
          setOverStatus((event.over?.id as TaskStatus | undefined) ?? null);
        }}
        onDragEnd={onDragEnd}
        onDragCancel={() => {
          setActiveId(null);
          setOverStatus(null);
        }}
      >
        <div
          ref={scrollerRef}
          style={{
            display: "flex",
            gap: 16,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            paddingBottom: 8,
            WebkitOverflowScrolling: "touch",
          }}
        >
          {TaskBoardColumnsConstant.map((column) => {
            const columnTasks = items.filter(
              (task) => task.status === column.status,
            );
            const isOverAllowed =
              !!activeTask && canDropTo(activeTask, column.status);

            return (
              <KanbanColumn
                key={column.status}
                status={column.status}
                label={column.label}
                accent={column.accent}
                tasks={columnTasks}
                showObject={showObject}
                isOverAllowed={
                  overStatus === column.status ? isOverAllowed : true
                }
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? (
            <Paper p="sm" radius="md" withBorder shadow="md" w={280}>
              <Text fw={600} size="sm">
                {activeTask.title}
              </Text>
            </Paper>
          ) : null}
        </DragOverlay>
      </DndContext>
    </Stack>
  );
}
