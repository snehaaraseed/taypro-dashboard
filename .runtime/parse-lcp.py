import json, sys

d = json.load(open(sys.argv[1]))
au = d.get("lighthouseResult", {}).get("audits", {})

el = au.get("largest-contentful-paint-element", {})
print("=== LCP element (mobile lab) ===")
print("  ", el.get("displayValue", "-"))
items = el.get("details", {}).get("items", [])
for it in items:
    sub = it.get("items", [])
    for s in sub:
        node = s.get("node", {})
        if node:
            print("   node:", node.get("snippet", "")[:160])
    if "phase" in str(it):
        pass
# phases breakdown
for it in items:
    for ph in it.get("items", []):
        if "phase" in ph:
            print("   phase:", ph.get("phase"), ph.get("percent"))

print()
print("=== Top opportunities (savings) ===")
for k, a in au.items():
    det = a.get("details", {})
    if det.get("type") == "opportunity":
        ms = det.get("overallSavingsMs", 0)
        if ms and ms > 50:
            print("   %-40s ~%d ms" % (a.get("title", k)[:40], ms))

print()
print("=== Render-blocking / preload-LCP relevant ===")
for k in ["render-blocking-resources", "prioritize-lcp-image", "lcp-lazy-loaded", "uses-responsive-images", "modern-image-formats", "efficient-animated-content", "uses-optimized-images"]:
    a = au.get(k, {})
    if a and a.get("score") not in (1, None):
        print("   %-34s score=%s  %s" % (k, a.get("score"), a.get("displayValue", "")))
