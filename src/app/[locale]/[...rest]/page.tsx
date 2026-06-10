import { notFound } from "next/navigation";
import { renderRecoveryNotFound } from "@/app/components/renderRecoveryNotFound";
import {
  applyRecovery,
  log404Hit,
  recoverStaticPath,
  shouldShowRecoveryNotFound,
} from "@/lib/url-recovery";

interface CatchAllPageProps {
  params: Promise<{ locale: string; rest?: string[] }>;
}

export default async function CatchAllPage({ params }: CatchAllPageProps) {
  const { locale, rest } = await params;
  const path = rest?.length ? `/${rest.join("/")}` : "/";

  const recovery = recoverStaticPath(path);
  applyRecovery(recovery);
  const recoveryContext = {
    suggestion: recovery.kind !== "none" ? recovery : undefined,
  };
  void log404Hit(
    path,
    recovery.kind !== "none" ? recovery.destination : undefined
  );

  if (shouldShowRecoveryNotFound(recoveryContext)) {
    return renderRecoveryNotFound(locale, recoveryContext);
  }

  notFound();
}
