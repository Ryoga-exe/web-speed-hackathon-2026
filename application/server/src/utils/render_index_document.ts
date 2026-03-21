import { promises as fs } from "node:fs";
import path from "node:path";

import { AppBootstrapData } from "@web-speed-hackathon-2026/client/src/bootstrap";
import { CLIENT_DIST_PATH } from "@web-speed-hackathon-2026/server/src/paths";

let cachedIndexTemplate: string | null = null;

const APP_SCRIPT_TAG_PATTERN = /<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function serializeBootstrap(data: unknown) {
  return JSON.stringify(data)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
}

async function loadIndexTemplate() {
  if (cachedIndexTemplate != null) {
    return cachedIndexTemplate;
  }

  cachedIndexTemplate = await fs.readFile(path.resolve(CLIENT_DIST_PATH, "index.html"), "utf8");
  return cachedIndexTemplate;
}

export async function renderIndexDocument({
  appHtml = "",
  bootstrap,
  headTags = "",
  scriptLoading = "eager",
  title,
}: {
  appHtml?: string;
  bootstrap?: AppBootstrapData;
  headTags?: string;
  scriptLoading?: "eager" | "idle" | "none";
  title: string;
}) {
  const template = await loadIndexTemplate();
  const appScriptSrcs = Array.from(template.matchAll(APP_SCRIPT_TAG_PATTERN), (match) => match[1]);
  const templateWithoutAppScripts =
    scriptLoading === "eager" ? template : template.replaceAll(APP_SCRIPT_TAG_PATTERN, "");
  const bootstrapScript =
    bootstrap != null && Object.keys(bootstrap).length > 0
      ? `<script>window.__CAX_BOOTSTRAP__=${serializeBootstrap(bootstrap)}</script>`
      : "";
  const lazyScriptLoader =
    scriptLoading === "idle" && appScriptSrcs.length > 0
      ? `<script>(function(){const scriptSrcs=${serializeBootstrap(appScriptSrcs)};let started=false;function removeInteractionListeners(){window.removeEventListener("pointerdown",startImmediately);window.removeEventListener("keydown",startImmediately);window.removeEventListener("touchstart",startImmediately);}function loadScriptSequentially(index){if(index>=scriptSrcs.length){return;}const script=document.createElement("script");script.src=scriptSrcs[index];script.defer=true;script.async=false;script.onload=function(){loadScriptSequentially(index+1)};document.body.appendChild(script);}function beginLoading(){if(started){return;}started=true;removeInteractionListeners();loadScriptSequentially(0);}function startImmediately(){beginLoading();}function startWhenIdle(){if(started){return;}window.requestIdleCallback(beginLoading,{timeout:1500});}window.addEventListener("pointerdown",startImmediately,{once:true,passive:true});window.addEventListener("keydown",startImmediately,{once:true});window.addEventListener("touchstart",startImmediately,{once:true,passive:true});if(document.readyState==="complete"){startWhenIdle();return;}window.addEventListener("load",startWhenIdle,{once:true});})();</script>`
      : "";

  return templateWithoutAppScripts
    .replace("<title>CaX</title>", `<title>${escapeHtml(title)}</title>`)
    .replace("</head>", `${headTags}</head>`)
    .replace('<div id="app"></div>', `<div id="app">${appHtml}</div>`)
    .replace("</body>", `${bootstrapScript}${lazyScriptLoader}</body>`);
}
