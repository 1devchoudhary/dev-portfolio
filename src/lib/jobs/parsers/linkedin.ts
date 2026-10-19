import type { PlatformRules } from "./common";

// Alert links look like linkedin.com/comm/jobs/view/4012345678/?trackingId=…
export const linkedin: PlatformRules = {
  source: "linkedin",
  hosts: ["linkedin.com"],
  canonical: (url) => {
    const m = url.pathname.match(/\/jobs\/view\/(?:[^/]*-)?(\d{6,})/);
    return m ? `https://www.linkedin.com/jobs/view/${m[1]}/` : null;
  },
};
