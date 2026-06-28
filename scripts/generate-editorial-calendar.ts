import "server-only";

import {
  generateEditorialCalendar,
  saveEditorialCalendar,
} from "@/lib/seo/editorial-calendar";
import { countBriefStats } from "@/lib/seo/discovered-brief-queue";

const cal = generateEditorialCalendar(90);
saveEditorialCalendar(cal);
const stats = countBriefStats();
console.log(
  `Wrote ${cal.days.length} calendar days (pool ${cal.stats?.candidatePool ?? "?"} open briefs)`
);
console.log(
  `Brief queue: ${stats.open} open / ${stats.total} total (${stats.filled} filled, ${stats.rejected} rejected)`
);
