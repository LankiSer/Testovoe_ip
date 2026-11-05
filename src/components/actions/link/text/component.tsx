"use client";

import { Anchor } from "@mantine/core";
import Link from "next/link";

export function TextLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Anchor component={Link} href={href}>
      {children}
    </Anchor>
  );
}
