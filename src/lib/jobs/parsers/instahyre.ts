import type { PlatformRules } from "./common";

// instahyre.com/job-123456-backend-developer-at-acme-bangalore/ or …/candidate/opportunities/?id=…
export const instahyre: PlatformRules = {
  source: "instahyre",
  hosts: ["instahyre.com"],
  canonical: (url) => {
    const m = url.pathname.match(/\/job-\d+[^/?#]*/);
    if (m) return `https://www.instahyre.com${m[0]}/`;
    const id = url.searchParams.get("id") ?? url.searchParams.get("job_id");
    return id && /opportunit/.test(url.pathname) ? `https://www.instahyre.com/candidate/opportunities/?id=${id}` : null;
  },
  acceptTrackedLinks: true,
};
