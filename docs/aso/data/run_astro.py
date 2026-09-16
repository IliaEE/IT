from mcp_client import MCP
import json, time, sys
seeds = json.load(open("seeds.json"))
allkw = [k for ks in seeds.values() for k in ks]
print("keywords:", len(allkw))
stores = ["us","ca","au","gb"]
m = MCP()
out = {}
for st in stores:
    out[st] = {}
    for i in range(0, len(allkw), 55):
        batch = allkw[i:i+55]
        for attempt in range(3):
            try:
                r = m.tool("add_keywords", {"appId": "100", "store": st, "keywords": batch})
                break
            except Exception as e:
                print("retry", st, i, e); time.sleep(3); m = MCP()
        for row in r["results"]:
            out[st][row["keyword"]] = row
        print(st, i, "added", r["added"], "skipped", r["skipped"], "failed", r["failed"], flush=True)
        json.dump(out, open("astro_raw.json","w"), indent=1, ensure_ascii=False)
print("done")
