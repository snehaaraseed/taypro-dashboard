import json, sys

path = sys.argv[1]
label = sys.argv[2]
d = json.load(open(path))

NAMES = {
    "LARGEST_CONTENTFUL_PAINT_MS": "LCP",
    "INTERACTION_TO_NEXT_PAINT": "INP",
    "CUMULATIVE_LAYOUT_SHIFT_SCORE": "CLS",
    "FIRST_CONTENTFUL_PAINT_MS": "FCP",
    "EXPERIMENTAL_TIME_TO_FIRST_BYTE": "TTFB",
}


def show(block, title):
    print("--- %s (%s) ---" % (title, label))
    if "metrics" not in block:
        print("   no field data")
        return
    print("   Overall:", block.get("overall_category"))
    for raw, metrics in block["metrics"].items():
        name = NAMES.get(raw, raw)
        p = metrics.get("percentile")
        cat = metrics.get("category")
        if name in ("LCP", "FCP", "TTFB"):
            val = "%.2fs" % (p / 1000.0)
        elif name == "CLS":
            val = "%.3f" % (p / 100.0)
        else:
            val = "%sms" % p
        print("   %-5s p75=%-8s %s" % (name, val, cat))


show(d.get("loadingExperience", {}), "THIS URL (page-level)")
show(d.get("originLoadingExperience", {}), "WHOLE ORIGIN (taypro.in)")
