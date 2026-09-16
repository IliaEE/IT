import json, sys, urllib.request

URL = "http://127.0.0.1:8089/mcp"

class MCP:
    def __init__(self):
        self.sid = None
        self.i = 0
        r = self.call("initialize", {"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"claude-code","version":"1"}}, raw=True)
        self.notify("notifications/initialized")
    def _post(self, body):
        req = urllib.request.Request(URL, data=json.dumps(body).encode(), method="POST")
        req.add_header("Content-Type","application/json")
        req.add_header("Accept","application/json, text/event-stream")
        if self.sid: req.add_header("Mcp-Session-Id", self.sid)
        with urllib.request.urlopen(req, timeout=120) as resp:
            sid = resp.headers.get("Mcp-Session-Id")
            if sid: self.sid = sid
            ctype = resp.headers.get("Content-Type","")
            text = resp.read().decode()
        if "text/event-stream" in ctype:
            msgs = []
            for line in text.splitlines():
                if line.startswith("data:"):
                    try: msgs.append(json.loads(line[5:].strip()))
                    except Exception: pass
            return msgs[-1] if msgs else None
        return json.loads(text) if text.strip() else None
    def notify(self, method, params=None):
        body = {"jsonrpc":"2.0","method":method}
        if params: body["params"] = params
        try: self._post(body)
        except Exception: pass
    def call(self, method, params=None, raw=False):
        self.i += 1
        body = {"jsonrpc":"2.0","id":self.i,"method":method}
        if params is not None: body["params"] = params
        r = self._post(body)
        if raw: return r
        if r and "error" in r: raise RuntimeError(json.dumps(r["error"]))
        return r["result"] if r else None
    def tool(self, name, args):
        res = self.call("tools/call", {"name": name, "arguments": args})
        out = []
        for c in res.get("content", []):
            if c.get("type") == "text": out.append(c["text"])
        txt = "\n".join(out)
        if res.get("isError"): raise RuntimeError(txt)
        try: return json.loads(txt)
        except Exception: return txt

if __name__ == "__main__":
    m = MCP()
    tools = m.call("tools/list")
    for t in tools.get("tools", []):
        print("##", t["name"])
        print(t.get("description",""))
        print(json.dumps(t.get("inputSchema",{}), ensure_ascii=False))
        print()
