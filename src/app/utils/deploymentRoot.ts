import path from "path";

/**
 * Directory that contains `package.json`, `src/`, `public/` for this deployment.
 *
 * In production, PM2 runs Next with `cwd = .next/standalone`. File-based CMS code
 * must not use `process.cwd()` alone or writes go under standalone, backups read
 * repo root, and `npm run build` wipes admin content.
 *
 * Set `TAYPRO_CMS_ROOT` (absolute path) in `.env.production` if your layout differs.
 */
export function getDeploymentRoot(): string {
  const env = process.env.TAYPRO_CMS_ROOT?.trim();
  if (env) {
    return path.resolve(env);
  }

  const cwd = path.resolve(process.cwd());
  const segments = cwd.split(path.sep);
  const standaloneIdx = segments.lastIndexOf("standalone");
  if (standaloneIdx > 0 && segments[standaloneIdx - 1] === ".next") {
    return segments.slice(0, standaloneIdx - 1).join(path.sep) || path.sep;
  }
  return cwd;
}
