import type { PlatformRules } from "./common";

// Job pages look like naukri.com/job-listings-node-js-developer-acme-pune-1-to-3-years-171025500123
export const naukri: PlatformRules = {
  source: "naukri",
  hosts: ["naukri.com"],
  canonical: (url) => {
    const m = url.pathname.match(/\/job-listings-[^/?#]+/);
    return m ? `https://www.naukri.com${m[0]}` : null;
  },
  acceptTrackedLinks: true,
};
