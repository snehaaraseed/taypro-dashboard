import json, sys

path = sys.argv[1]
label = sys.argv[2]
d = json.load(open(path))
if "error" in d:
    print("PSI ERROR:", d["error"].get("message"))
    sys.exit(0)

lr = d.get("lighthouseResult", {})
cat = lr.get("categories", {}).get("performance", {})
au = lr.get("audits", {})
print("=== Lighthouse LAB (%s) ===" % label)
print("Performance score:", round((cat.get("score") or 0) * 100), "/100")
keys = [
    "largest-contentful-paint",
    "first-contentful-paint",
    "total-blocking-time",
    "cumulative-layout-shift",
    "speed-index",
    "interactive",
    "server-response-time",
    "total-byte-weight",
    "dom-size",
    "unused-javascript",
    "mainthread-work-breakdown",
]
for k in keys:
    a = au.get(k, {})
    dv = a.get("displayValue", "-")
    print("  %-28s %s" % (k, dv))

le = d.get("loadingExperience", {})
print("CrUX field data:", le.get("overall_category", "NONE / insufficient real-user traffic"))
