import type { ProjectFactsJson } from "@/lib/cms/project-facts-types";
import { buildStatsTableRows } from "@/lib/cms/compose-project-content";

type ProjectStatsTableProps = {
  facts: ProjectFactsJson;
  className?: string;
  metricLabel?: string;
  valueLabel?: string;
  disclaimer?: string;
};

export function ProjectStatsTable({
  facts,
  className = "",
  metricLabel = "Metric",
  valueLabel = "Reported value",
  disclaimer = "Figures are site-reported. Validate against your SCADA, curtailment, and disclosure methodology before investment committee use.",
}: ProjectStatsTableProps) {
  const rows = buildStatsTableRows(facts);

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm ${className}`.trim()}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-left">
          <thead>
            <tr>
              <th className="bg-[#052638] px-5 py-3.5 text-sm font-semibold text-white">
                {metricLabel}
              </th>
              <th className="bg-[#052638] px-5 py-3.5 text-sm font-semibold text-white">
                {valueLabel}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.label}
                className={index % 2 === 0 ? "bg-white" : "bg-[#f8fafb]"}
              >
                <td className="border-t border-gray-100 px-5 py-3.5 text-sm font-medium text-[#052638]">
                  {row.label}
                </td>
                <td className="border-t border-gray-100 px-5 py-3.5 text-sm text-[#27415c]">
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-gray-100 bg-[#f4f7f9] px-5 py-4 text-sm leading-relaxed text-[#27415c]/80">
        {disclaimer}
      </p>
    </div>
  );
}
