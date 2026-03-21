import React from "react";
void React;
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";

import { AppPage } from "@web-speed-hackathon-2026/client/src/components/application/AppPage";
import { TermPage } from "@web-speed-hackathon-2026/client/src/components/term/TermPage";

const TERMS_AUTH_MODAL_ID = "terms-auth-modal";
const TERMS_NEW_POST_MODAL_ID = "terms-new-post-modal";

export function renderTermsApp() {
  return renderToString(
    <MemoryRouter initialEntries={["/terms"]}>
      <AppPage
        activeUser={null}
        authModalId={TERMS_AUTH_MODAL_ID}
        newPostModalId={TERMS_NEW_POST_MODAL_ID}
        onLogout={() => {}}
      >
        <TermPage />
      </AppPage>
    </MemoryRouter>,
  );
}
