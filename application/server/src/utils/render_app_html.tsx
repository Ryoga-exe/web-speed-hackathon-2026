import type { AppBootstrapData } from "@web-speed-hackathon-2026/client/src/bootstrap";

interface Params {
  bootstrap?: AppBootstrapData;
  pathname: string;
}

async function loadRenderApp() {
  const moduleUrl = new URL("../../../client/src/ssr/render_app.tsx", import.meta.url).href;
  const module = await import(moduleUrl);
  return module as {
    renderApp: (params: { bootstrap?: AppBootstrapData; pathname: string }) => string;
  };
}

export async function renderAppHtml({ bootstrap, pathname }: Params) {
  const { renderApp } = await loadRenderApp();
  return renderApp({ bootstrap, pathname });
}
