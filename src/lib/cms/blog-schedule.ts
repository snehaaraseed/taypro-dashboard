/** Blog publish / schedule helpers (pure — safe on server and client). */

export type BlogPublishInput = {
  published?: boolean;
  scheduledPublishAt?: string | null;
  publishDate?: string;
};

export type ResolvedBlogPublishFields = {
  published: boolean;
  scheduledPublishAt: string | null;
  publishDate: string;
};

const FUTURE_SCHEDULE_BUFFER_MS = 60_000;

export function isFutureScheduledPublish(
  scheduledPublishAt: string | null | undefined,
  nowMs = Date.now()
): boolean {
  if (!scheduledPublishAt) return false;
  const t = new Date(scheduledPublishAt).getTime();
  if (Number.isNaN(t)) return false;
  return t > nowMs + FUTURE_SCHEDULE_BUFFER_MS;
}

export function isBlogScheduledDraft(meta: {
  published?: boolean;
  scheduledPublishAt?: string | null;
}): boolean {
  return meta.published === false && Boolean(meta.scheduledPublishAt);
}

export function isBlogScheduledPending(meta: {
  published?: boolean;
  scheduledPublishAt?: string | null;
}): boolean {
  return (
    isBlogScheduledDraft(meta) &&
    isFutureScheduledPublish(meta.scheduledPublishAt)
  );
}

export function resolveBlogPublishFields(
  input: BlogPublishInput,
  existing?: {
    published: boolean;
    scheduledPublishAt?: string | null;
    publishDate: string;
  }
):
  | { ok: true; value: ResolvedBlogPublishFields }
  | { ok: false; error: string } {
  const nowIso = new Date().toISOString();

  let scheduledPublishAt: string | null;
  if (input.scheduledPublishAt === undefined) {
    scheduledPublishAt = existing?.scheduledPublishAt ?? null;
  } else if (
    input.scheduledPublishAt === null ||
    input.scheduledPublishAt === ""
  ) {
    scheduledPublishAt = null;
  } else {
    const parsed = new Date(input.scheduledPublishAt);
    if (Number.isNaN(parsed.getTime())) {
      return { ok: false, error: "Invalid scheduled publish date and time." };
    }
    scheduledPublishAt = parsed.toISOString();
  }

  let published =
    input.published !== undefined
      ? input.published
      : (existing?.published ?? true);

  if (scheduledPublishAt) {
    if (isFutureScheduledPublish(scheduledPublishAt)) {
      published = false;
    } else {
      published = true;
      scheduledPublishAt = null;
    }
  }

  if (published) {
    scheduledPublishAt = null;
  }

  let publishDate =
    input.publishDate?.trim() ||
    existing?.publishDate ||
    scheduledPublishAt ||
    nowIso;

  if (!published && scheduledPublishAt) {
    publishDate = scheduledPublishAt;
  }

  return {
    ok: true,
    value: { published, scheduledPublishAt, publishDate },
  };
}

/** Format ISO datetime for `<input type="datetime-local" />` in local time. */
export function toDatetimeLocalInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function datetimeLocalInputToIso(value: string): string | null {
  if (!value.trim()) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function isoToDateInputValue(iso: string | null | undefined): string {
  if (!iso) return new Date().toISOString().split("T")[0];
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return new Date().toISOString().split("T")[0];
  return d.toISOString().split("T")[0];
}
