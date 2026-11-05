import { Center, Stack, Title } from "@mantine/core";
import { AuthLoginForm } from "@/components/forms/auth/login/component";

export default function LoginPage() {
  return (
    <Center mih="100vh" p="md">
      <Stack align="center" gap="lg" maw={480} w="100%">
        <Title order={2}>Объекты и задачи</Title>
        <AuthLoginForm />
      </Stack>
    </Center>
  );
}
