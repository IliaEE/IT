import json, urllib.request, urllib.parse, time, sys

TERMS = [
  "remove background","background eraser","transparent background",
  "photo enhancer","image upscaler","unblur photo",
  "heic to jpg","image converter","png to jpg",
  "photo compressor","reduce photo size","resize photo","image resizer",
  "image to svg","vectorize","svg converter",
  "object remover","remove objects from photo",
  "photo restoration","restore old photos",
  "passport photo","photo tools","image tools",
]
out = {}
for t in TERMS:
    url = "https://itunes.apple.com/search?" + urllib.parse.urlencode({"term": t, "country": "us", "entity": "software", "limit": 25})
    try:
        with urllib.request.urlopen(url, timeout=20) as r:
            data = json.load(r)
    except Exception as e:
        out[t] = {"error": str(e)}; continue
    apps = []
    for a in data.get("results", []):
        apps.append({
            "name": a.get("trackName"),
            "ratings": a.get("userRatingCount", 0),
            "avg": round(a.get("averageUserRating", 0) or 0, 2),
            "price": a.get("formattedPrice"),
            "genre": a.get("primaryGenreName"),
            "seller": a.get("sellerName"),
        })
    apps.sort(key=lambda x: -x["ratings"])
    out[t] = {"count": data.get("resultCount", 0), "top": apps[:8], "sum_top10": sum(a["ratings"] for a in apps[:10])}
    time.sleep(0.4)
json.dump(out, open("itunes_probe.json","w"), indent=1, ensure_ascii=False)
for t,v in out.items():
    if "error" in v: print(f"{t}: ERROR {v['error']}"); continue
    print(f"\n## {t}  (results={v['count']}, ratings top10={v['sum_top10']:,})")
    for a in v["top"][:6]:
        print(f"  - {a['name']} — {a['ratings']:,} ratings, {a['avg']}★, {a['price']}")
