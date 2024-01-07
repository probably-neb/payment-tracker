import { ParentProps } from "solid-js";
import { fade } from "@/lib/fade";
import { useRep } from "@/lib/rep";
import { Show } from "solid-js";
import { Button } from "@/components/ui/button";
import {dropAllDatabases} from "replicache"

export default function Layout({ children }: ParentProps) {
    // TODO: current user hook (and store current user at known key in rep)
    // for profile at top right

    // TODO: breadcrumbs in title bar
    return (
        <>
            <main class={`min-h-screen bg-gradient-to-br ${fade}`}>
                <div class="flex flex-row justify-between items-center px-4 pt-4">
                    <div class="text-white">
                        <h1 class="text-4xl font-bold">Paypals</h1>
                    </div>
                    <Show when={import.meta.env.VITE_IS_LOCAL}>
                        <div class="flex justify-evenly gap-2">
                            <ForcePullButton />
                            <DropDataButton />
                        </div>
                    </Show>
                </div>
                {children}
            </main>
        </>
    );
}
// TODO: consider rebranding as "sync" and including in non-local
function ForcePullButton() {
    const rep = useRep()
    const onClick = async () => {
        if (!rep()) {
            console.error("rep not initialized")
        }
        await rep()?.pull({now: true})
    }
    return <Show when={rep()}>
        <Button variant="outline" onClick={onClick}>Pull</Button>
    </Show>
}

function DropDataButton() {
    // TODO: reinit rep after drop
    const onClick = async () => {
        const dropped = await dropAllDatabases()
        console.log("dropped", dropped.dropped)
        if (dropped.errors.length > 0) {
            console.error("errors", dropped.errors)
        }
    }
    return <Button variant="outline" onClick={onClick}>Drop</Button>
}
