-- Rebuild blogs/projects: remove legacy `slug TEXT UNIQUE` (blocks per-locale rows).
-- Schema change runs in ensureSlugLocaleUnique() after migrate (idempotent).
SELECT 1;
