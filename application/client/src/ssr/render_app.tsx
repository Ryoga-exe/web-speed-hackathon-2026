import React from "react";
void React;
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";

import { AppBootstrapData } from "@web-speed-hackathon-2026/client/src/bootstrap";
import { AppContainer } from "@web-speed-hackathon-2026/client/src/containers/AppContainer";

interface Params {
  bootstrap?: AppBootstrapData;
  pathname: string;
}

export function renderApp({ bootstrap, pathname }: Params) {
  return renderToString(
    <MemoryRouter initialEntries={[pathname]}>
      <AppContainer bootstrap={bootstrap} />
    </MemoryRouter>,
  );
}
