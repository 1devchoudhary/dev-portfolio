import type { PlatformRules } from "./common";

// wellfound.com/jobs/3123456-backend-engineer or wellfound.com/company/acme/jobs/3123456-…
export const wellfound: PlatformRules = {
  source: "wellfound",
  hosts: ["wellfound.com", "angel.co"],
  canonical: (url) => {
    const m = url.pathname.match(/\/jobs\/(\d+)[^/?#]*/);
    return m ? `https://wellfound.com/jobs/${m[0].slice("/jobs/".length)}` : null;
  },
  acceptTrackedLinks: true,
};
