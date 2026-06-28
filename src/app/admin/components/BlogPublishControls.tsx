"use client";

import { useState } from "react";
import {
  datetimeLocalInputToIso,
  isFutureScheduledPublish,
  toDatetimeLocalInputValue,
} from "@/lib/cms/blog-schedule";

export type BlogPublishFormState = {
  published: boolean;
  scheduledPublishAt: string | null;
  publishDate: string;
};

type PublishMode = "published" | "draft" | "scheduled";

type BlogPublishControlsProps = {
  value: BlogPublishFormState;
  onChange: (next: BlogPublishFormState) => void;
};

function deriveMode(value: BlogPublishFormState): PublishMode {
  if (value.published) return "published";
  if (
    value.scheduledPublishAt &&
    isFutureScheduledPublish(value.scheduledPublishAt)
  ) {
    return "scheduled";
  }
  return "draft";
}

export default function BlogPublishControls({
  value,
  onChange,
}: BlogPublishControlsProps) {
  const mode = deriveMode(value);
  const scheduleLocal = toDatetimeLocalInputValue(value.scheduledPublishAt);
  // Lazy init: compute the "2 minutes from now" floor once on mount so we don't
  // call the impure Date.now() during render (react-hooks/purity).
  const [minScheduleLocal] = useState(() =>
    toDatetimeLocalInputValue(new Date(Date.now() + 2 * 60_000).toISOString())
  );

  const setMode = (next: PublishMode) => {
    if (next === "published") {
      onChange({
        ...value,
        published: true,
        scheduledPublishAt: null,
      });
      return;
    }
    if (next === "draft") {
      onChange({
        ...value,
        published: false,
        scheduledPublishAt: null,
      });
      return;
    }
    const defaultSchedule =
      value.scheduledPublishAt ||
      datetimeLocalInputToIso(
        toDatetimeLocalInputValue(
          new Date(Date.now() + 60 * 60_000).toISOString()
        )
      );
    onChange({
      ...value,
      published: false,
      scheduledPublishAt: defaultSchedule,
      publishDate: defaultSchedule
        ? new Date(defaultSchedule).toISOString().split("T")[0]
        : value.publishDate,
    });
  };

  return (
    <div className="space-y-4 rounded-md border border-gray-200 bg-gray-50 px-4 py-4">
      <p className="text-sm font-medium text-gray-800">Visibility</p>
      <div className="space-y-2">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="radio"
            name="blog-publish-mode"
            checked={mode === "published"}
            onChange={() => setMode("published")}
            className="mt-1"
          />
          <span>
            <span className="block text-sm font-medium text-gray-700">
              Publish now
            </span>
            <span className="text-xs text-gray-500">
              Visible on the website immediately after save.
            </span>
          </span>
        </label>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="radio"
            name="blog-publish-mode"
            checked={mode === "draft"}
            onChange={() => setMode("draft")}
            className="mt-1"
          />
          <span>
            <span className="block text-sm font-medium text-gray-700">
              Save as draft
            </span>
            <span className="text-xs text-gray-500">
              Hidden until you publish manually.
            </span>
          </span>
        </label>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="radio"
            name="blog-publish-mode"
            checked={mode === "scheduled"}
            onChange={() => setMode("scheduled")}
            className="mt-1"
          />
          <span>
            <span className="block text-sm font-medium text-gray-700">
              Schedule publish
            </span>
            <span className="text-xs text-gray-500">
              Stays a draft until the chosen date and time (your browser&apos;s
              local timezone).
            </span>
          </span>
        </label>
      </div>

      {mode === "scheduled" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Publish at
          </label>
          <input
            type="datetime-local"
            value={scheduleLocal}
            min={minScheduleLocal}
            onChange={(e) => {
              const iso = datetimeLocalInputToIso(e.target.value);
              onChange({
                ...value,
                published: false,
                scheduledPublishAt: iso,
                publishDate: iso
                  ? new Date(iso).toISOString().split("T")[0]
                  : value.publishDate,
              });
            }}
            className="w-full max-w-md px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Published date
        </label>
        <input
          type="date"
          value={value.publishDate}
          onChange={(e) =>
            onChange({ ...value, publishDate: e.target.value })
          }
          disabled={mode === "scheduled"}
          className="w-full max-w-md px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          {mode === "scheduled"
            ? "Matches the scheduled publish date (used for SEO and sorting)."
            : "Original publication date (used for SEO and sorting)."}
        </p>
      </div>
    </div>
  );
}
