import { Helmet } from "@web-speed-hackathon-2026/client/src/components/foundation/Helmet";

import { NotFoundPage } from "@web-speed-hackathon-2026/client/src/components/application/NotFoundPage";

export const NotFoundContainer = () => {
  return (
    <>
      <Helmet>
        <title>ページが見つかりません - CaX</title>
      </Helmet>
      <NotFoundPage />
    </>
  );
};
