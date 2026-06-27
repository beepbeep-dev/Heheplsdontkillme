import http from "node:http";
import path from "node:path";
import { createBareServer } from "@nebula-services/bare-server-node";
import express from "express";
import cors from "cors";
import compression from "compression";
import bareMuxNode from "@mercuryworkshop/bare-mux/node";
import { server as wisp } from "@mercuryworkshop/wisp-js/server";

const __dirname = process.cwd();
const server = http.createServer();
const app = express();
const bareServer = createBareServer("/ca/");
const { baremuxPath } = bareMuxNode;
const epoxyDistPath = path.join(__dirname, "node_modules", "@mercuryworkshop", "epoxy-transport", "dist");
const PORT = process.env.PORT || 8080;

wisp.options.allow_loopback_ips = true;
wisp.options.allow_private_ips = true;

app.use(compression());
app.use(cors({ origin: true }));

const staticOptions = {
  maxAge: "1d",
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath);
    if (ext === ".mjs" || ext === ".js") res.type("text/javascript");
    else if (ext === ".wasm") res.type("application/wasm");
    if ([".js", ".mjs", ".css", ".wasm"].includes(ext)) {
      res.setHeader("Cache-Control", "public, max-age=86400");
    }
  },
};

// index.html: no cache so updates are instant
app.get("/", (_req, res) => {
  res.setHeader("Cache-Control", "no-cache");
  res.sendFile(path.join(__dirname, "static", "index.html"));
});

app.use("/bm", express.static(baremuxPath, staticOptions));
app.use("/ep", express.static(epoxyDistPath, staticOptions));
app.use("/uv", express.static(path.join(__dirname, "static", "uv"), staticOptions));
app.use(express.static(path.join(__dirname, "static"), staticOptions));

app.use((_req, res) => res.status(404).send("Not found"));

server.on("request", (req, res) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeRequest(req, res);
  } else {
    app(req, res);
  }
});

server.on("upgrade", (req, socket, head) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeUpgrade(req, socket, head);
  } else {
    wisp.routeRequest(req, socket, head);
  }
});

server.listen(PORT, () => {
  console.log(`Cole's OS running on http://localhost:${PORT}`);
});
