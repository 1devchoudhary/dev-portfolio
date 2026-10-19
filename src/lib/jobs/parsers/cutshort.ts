import type { PlatformRules } from "./common";

// cutshort.io/job/Backend-Developer-Pune-Acme-AbCdEf12
export const cutshort: PlatformRules = {
  source: "cutshort",
  hosts: ["cutshort.io"],
  canonical: (url) => {
    const m = url.pathname.match(/\/job\/[^/?#]+/);
    return m ? `https://cutshort.io${m[0]}` : null;
  },
  acceptTrackedLinks: true,
};
