let cachedRenderTermsAppPromise: Promise<{
  renderTermsApp: () => string;
}> | null = null;

async function loadRenderTermsApp() {
  if (cachedRenderTermsAppPromise != null) {
    return cachedRenderTermsAppPromise;
  }

  cachedRenderTermsAppPromise = (async () => {
    const moduleUrl = new URL("../../../client/src/ssr/render_terms_app.tsx", import.meta.url).href;
    const module = await import(moduleUrl);
    return module as {
      renderTermsApp: () => string;
    };
  })();

  return cachedRenderTermsAppPromise;
}

export async function renderTermsAppHtml() {
  const { renderTermsApp } = await loadRenderTermsApp();
  return renderTermsApp();
}
