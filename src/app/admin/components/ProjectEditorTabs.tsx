"use client";

import * as React from "react";
import type {
  ProjectEditorialStatus,
  ProjectFactsJson,
  ProjectSectionsJson,
} from "@/lib/cms/project-facts-types";
import { ProjectStatsTable } from "@/app/components/ProjectStatsTable";
import { resolveProjectWordCountPolicy } from "@/lib/seo/project-content-outline";

type TabId = "overview" | "facts" | "narrative" | "seo";

export type ProjectEditorState = {
  title: string;
  slug: string;
  description: string;
  image: string;
  imageAlt: string;
  details: string[];
  date: string;
  content: string;
  author: string;
  published: boolean;
  facts: ProjectFactsJson;
  sections: ProjectSectionsJson;
  editorialStatus: ProjectEditorialStatus;
  seoKeyword: string;
};

type ProjectEditorTabsProps = {
  state: ProjectEditorState;
  onChange: (patch: Partial<ProjectEditorState>) => void;
  slug: string;
  onInferFacts: () => Promise<void>;
  onImproveSection: (sectionId: string) => Promise<void>;
  onImproveAll: () => Promise<void>;
  busy?: boolean;
};

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "facts", label: "Site facts" },
  { id: "narrative", label: "Narrative" },
  { id: "seo", label: "SEO & AI" },
];

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

export function ProjectEditorTabs({
  state,
  onChange,
  slug,
  onInferFacts,
  onImproveSection,
  onImproveAll,
  busy = false,
}: ProjectEditorTabsProps) {
  const [tab, setTab] = React.useState<TabId>("overview");
  const policy = resolveProjectWordCountPolicy(
    state.facts,
    state.editorialStatus,
    slug
  );
  const descLen = state.description.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              tab === t.id
                ? "bg-[#052638] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-500 self-center">
          Tier: {policy.tier} · target {policy.targetMin}–{policy.targetMax} words
        </span>
      </div>

      {tab === "overview" && (
        <div className="space-y-4">
          <Field label="Site title">
            <input
              type="text"
              value={state.title}
              onChange={(e) => onChange({ title: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </Field>
          <Field label={`Meta description (${descLen}/140–160)`}>
            <textarea
              value={state.description}
              onChange={(e) => onChange({ description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-md"
            />
          </Field>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={state.published}
              onChange={(e) => onChange({ published: e.target.checked })}
            />
            <label htmlFor="published" className="text-sm text-gray-700">
              Published
            </label>
          </div>
          <p className="text-xs text-gray-500">
            Hero image is preserved on AI improve, change it here only manually.
          </p>
        </div>
      )}

      {tab === "facts" && (
        <div className="space-y-4">
          <button
            type="button"
            disabled={busy}
            onClick={() => void onInferFacts()}
            className="text-sm px-3 py-2 bg-[#A8C117] text-[#052638] rounded-md font-medium disabled:opacity-50"
          >
            Infer from location
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(
              [
                ["location", "Location"],
                ["state", "State"],
                ["capacityMw", "Capacity (MW)"],
                ["arrayType", "Array type"],
                ["automaticRobots", "Automatic robots"],
                ["semiAutomaticRobots", "Semi-automatic robots"],
                ["robotSystem", "Robot system"],
                ["cleaningMode", "Cleaning mode"],
                ["procurement", "Procurement"],
                ["waterSavedPerYear", "Water saved / year"],
                ["additionalGenerationPerYear", "Generation uplift"],
                ["co2SavedPerYear", "CO₂ saved"],
              ] as const
            ).map(([key, label]) => (
              <Field key={key} label={label}>
                <input
                  type="text"
                  value={String(state.facts[key] ?? "")}
                  onChange={(e) =>
                    onChange({
                      facts: { ...state.facts, [key]: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </Field>
            ))}
          </div>
          <Field label="Soiling context">
            <textarea
              value={state.facts.soiling ?? ""}
              onChange={(e) =>
                onChange({ facts: { ...state.facts, soiling: e.target.value } })
              }
              rows={3}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </Field>
          <Field label="O&M challenge">
            <textarea
              value={state.facts.omChallenge ?? ""}
              onChange={(e) =>
                onChange({
                  facts: { ...state.facts, omChallenge: e.target.value },
                })
              }
              rows={2}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </Field>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Stats table preview
            </p>
            <ProjectStatsTable facts={state.facts} />
          </div>
        </div>
      )}

      {tab === "narrative" && (
        <div className="space-y-6">
          <Field label="Executive summary">
            <textarea
              value={state.sections.executiveSummary}
              onChange={(e) =>
                onChange({
                  sections: {
                    ...state.sections,
                    executiveSummary: e.target.value,
                  },
                })
              }
              rows={5}
              className="w-full px-3 py-2 border rounded-md font-mono text-sm"
            />
            <button
              type="button"
              disabled={busy}
              className="mt-2 text-xs text-[#5a8f00] font-medium"
              onClick={() => void onImproveSection("executiveSummary")}
            >
              Regenerate with AI
            </button>
          </Field>
          {state.sections.narrative.map((section) => (
            <div key={section.id} className="border rounded-lg p-4">
              <Field label={section.heading}>
                <textarea
                  value={section.bodyHtml}
                  onChange={(e) =>
                    onChange({
                      sections: {
                        ...state.sections,
                        narrative: state.sections.narrative.map((s) =>
                          s.id === section.id
                            ? { ...s, bodyHtml: e.target.value }
                            : s
                        ),
                      },
                    })
                  }
                  rows={6}
                  className="w-full px-3 py-2 border rounded-md font-mono text-sm"
                />
              </Field>
              <button
                type="button"
                disabled={busy}
                className="mt-2 text-xs text-[#5a8f00] font-medium"
                onClick={() => void onImproveSection(section.id)}
              >
                Regenerate section
              </button>
            </div>
          ))}
          <button
            type="button"
            disabled={busy}
            onClick={() => void onImproveAll()}
            className="px-4 py-2 bg-[#052638] text-white rounded-md text-sm font-medium disabled:opacity-50"
          >
            Improve all narrative sections
          </button>
        </div>
      )}

      {tab === "seo" && (
        <div className="space-y-4">
          <Field label="Primary SEO keyword">
            <input
              type="text"
              value={state.seoKeyword}
              onChange={(e) => onChange({ seoKeyword: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </Field>
          <Field label="Editorial status">
            <select
              value={state.editorialStatus}
              onChange={(e) =>
                onChange({
                  editorialStatus: e.target.value as ProjectEditorialStatus,
                })
              }
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="legacy">Legacy</option>
              <option value="ai_draft">AI draft</option>
              <option value="editorial_v2">Editorial v2</option>
              <option value="flagship">Flagship</option>
            </select>
          </Field>
          <a
            href={`/projects/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#5a8f00] underline"
          >
            View public page
          </a>
        </div>
      )}
    </div>
  );
}
