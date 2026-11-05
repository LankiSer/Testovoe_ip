"use client";

import {
  Badge,
  Card,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useMemo, useState } from "react";
import { TextLink } from "@/components/actions/link/text/component";
import { ObjectManagerToolbar } from "@/components/actions/object/manager-toolbar/component";
import type { ObjectsReadDto } from "@/shared/api/objects/dtos/read";

type SortKey = "open_desc" | "name_asc" | "newest";

export function ObjectList({
  objects,
  canManage,
}: {
  objects: ObjectsReadDto[];
  canManage: boolean;
}) {
  const [sort, setSort] = useState<SortKey>("open_desc");

  const sorted = useMemo(() => {
    const copy = [...objects];
    if (sort === "name_asc") {
      copy.sort((a, b) => a.name.localeCompare(b.name, "ru"));
    } else if (sort === "newest") {
      copy.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    } else {
      copy.sort(
        (a, b) => (b.open_tasks_count ?? 0) - (a.open_tasks_count ?? 0),
      );
    }
    return copy;
  }, [objects, sort]);

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={2}>Объекты</Title>
          <Text c="dimmed" size="sm">
            {objects.length} строительных объектов
          </Text>
        </div>
        <Group>
          <Select
            w={220}
            value={sort}
            onChange={(value) => setSort((value as SortKey) ?? "open_desc")}
            data={[
              { value: "open_desc", label: "Сначала больше открытых" },
              { value: "name_asc", label: "По названию" },
              { value: "newest", label: "Сначала новые" },
            ]}
          />
          {canManage ? <ObjectManagerToolbar /> : null}
        </Group>
      </Group>

      {sorted.length === 0 ? (
        <Card withBorder padding="xl" radius="md">
          <Text c="dimmed">Нет доступных объектов</Text>
        </Card>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {sorted.map((object) => (
            <Card
              key={object.id}
              withBorder
              padding="lg"
              radius="md"
              style={{ background: "#fff" }}
            >
              <Stack gap="sm">
                <div>
                  <Text fw={650} size="lg" style={{ letterSpacing: "-0.01em" }}>
                    <TextLink href={`/objects/${object.id}`}>
                      {object.name}
                    </TextLink>
                  </Text>
                  <Text size="sm" c="dimmed" mt={4}>
                    {object.address}
                  </Text>
                </div>
                <Group gap="xs">
                  <Badge variant="light" color="blue">
                    {object.tasks_count ?? 0} задач
                  </Badge>
                  <Badge variant="outline" color="gray">
                    {object.open_tasks_count ?? 0} открытых
                  </Badge>
                </Group>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
}
