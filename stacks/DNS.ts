import { StackContext } from "sst/constructs";

const MAPPING: Record<string, string> = {
    production: "prod.bivvy.cc",
    prod: "prod.bivvy.cc",
}

export default function DNS({ stack, app}: StackContext) {
    const stage = app.stage
    const zone = MAPPING[stage] || "dev.bivvy.cc"
    const domain = MAPPING[stage] || `${stage}.dev.bivvy.cc`

    return {
        zone,
        domain
    }
}