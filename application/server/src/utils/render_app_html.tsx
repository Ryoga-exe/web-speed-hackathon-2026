import type { AppBootstrapData } from "@web-speed-hackathon-2026/client/src/bootstrap";

interface Params {
  bootstrap?: AppBootstrapData;
  pathname: string;
}

let cachedRenderAppPromise: Promise<{
  renderApp: (params: { bootstrap?: AppBootstrapData; pathname: string }) => string;
}> | null = null;

async function loadRenderApp() {
  if (cachedRenderAppPromise != null) {
    return cachedRenderAppPromise;
  }

  cachedRenderAppPromise = (async () => {
    const moduleUrl = new URL("../../../client/src/ssr/render_app.tsx", import.meta.url).href;
    const module = await import(moduleUrl);
    return module as {
      renderApp: (params: { bootstrap?: AppBootstrapData; pathname: string }) => string;
    };
  })();

  return cachedRenderAppPromise;
}

export async function renderAppHtml({ bootstrap, pathname }: Params) {
  const { renderApp } = await loadRenderApp();
  return renderApp({ bootstrap, pathname });
}
