"use client";

import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  AppShellNavbar,
  Badge,
  Button,
  Group,
  NavLink,
  Text,
  Title,
} from "@mantine/core";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserRoleLabelConstant, type UserRole } from "@/common/constants/user-role";
import { createClient } from "@/shared/api/supabase/client";

export function CabinetShell({
  children,
  profile,
}: {
  children: React.ReactNode;
  profile: {
    full_name: string;
    email: string;
    role: UserRole;
  };
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function onLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{ width: 220, breakpoint: "sm" }}
      padding="lg"
      styles={{
        main: { background: "#fafafa" },
        navbar: {
          background: "#fff",
          borderRight: "1px solid #e5e5e5",
        },
        header: {
          background: "#fff",
          borderBottom: "1px solid #e5e5e5",
        },
      }}
    >
      <AppShellHeader px="lg">
        <Group h="100%" justify="space-between">
          <div>
            <Title order={4} style={{ letterSpacing: "-0.02em" }}>
              Объекты и задачи
            </Title>
            <Text size="xs" c="dimmed">
              Управление строительными работами
            </Text>
          </div>
          <Group gap="md">
            <div style={{ textAlign: "right" }}>
              <Text size="sm" fw={600}>
                {profile.full_name || profile.email}
              </Text>
              <Badge size="sm" variant="light" color="blue">
                {UserRoleLabelConstant[profile.role]}
              </Badge>
            </div>
            <Button variant="default" onClick={onLogout}>
              Выйти
            </Button>
          </Group>
        </Group>
      </AppShellHeader>

      <AppShellNavbar p="md">
        <Text size="xs" c="dimmed" tt="uppercase" mb={8} fw={600}>
          Разделы
        </Text>
        <NavLink
          component={Link}
          href="/board"
          label="Общая доска"
          active={pathname.startsWith("/board")}
          style={{ borderRadius: 8 }}
        />
        <NavLink
          component={Link}
          href="/my-tasks"
          label="Мои задачи"
          active={pathname.startsWith("/my-tasks")}
          style={{ borderRadius: 8 }}
        />
        <NavLink
          component={Link}
          href="/objects"
          label="Объекты"
          active={pathname.startsWith("/objects")}
          style={{ borderRadius: 8 }}
        />
      </AppShellNavbar>

      <AppShellMain>{children}</AppShellMain>
    </AppShell>
  );
}
