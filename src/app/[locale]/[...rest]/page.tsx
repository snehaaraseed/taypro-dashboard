import { notFound } from "next/navigation";
import {
  applyRecovery,
  log404Hit,
  recoverStaticPath,
} from "@/lib/url-recovery";
import { recoveryNotFoundMetadata } from "@/lib/seo/recovery-not-found-metadata";
import type { Metadata } from "next";

interface CatchAllPageProps {
  params: Promise<{ locale: string; rest?: string[] }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return recoveryNotFoundMetadata();
}

export default async function CatchAllPage({ params }: CatchAllPageProps) {
  const { rest } = await params;
  const path = rest?.length ? `/${rest.join("/")}` : "/";

  const recovery = recoverStaticPath(path);
  applyRecovery(recovery);
  void log404Hit(
    path,
    recovery.kind !== "none" ? recovery.destination : undefined
  );

  notFound();
}
