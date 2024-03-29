import {
    Config,
    StackContext,
    StaticSite,
    use,
} from "sst/constructs";
import Api from "./Api";
import DNS from "./DNS";

export default function SITE({ stack, app }: StackContext) {
    const { apiUrl } = use(Api);
    const dns = use(DNS);

    const REPLICACHE_LICENSE_KEY = "lf7fcf72797fa44a3a0b0469a7af59d61";

    const site = new StaticSite(stack, "Site", {
        path: "packages/site",
        buildOutput: "dist",
        buildCommand: "pnpm run build",
        environment: {
            VITE_IS_LOCAL: String(app.local),
            VITE_API_URL: apiUrl,
            VITE_REPLICACHE_LICENSE_KEY: REPLICACHE_LICENSE_KEY,
        },
        customDomain: !app.local ? {
            domainName: dns.domain,
            hostedZone: dns.zone,
        } : undefined
    });

    const siteUrl = site.customDomainUrl || site.url;

    stack.addOutputs({
        SiteUrl: siteUrl,
    });

    return {
        site,
        siteUrl
    };
}
