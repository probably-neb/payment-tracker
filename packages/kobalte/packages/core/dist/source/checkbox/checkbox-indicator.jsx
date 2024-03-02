import { mergeDefaultProps, mergeRefs } from "@kobalte/utils";
import { Show, splitProps } from "solid-js";
import { useFormControlContext } from "../form-control";
import { Polymorphic } from "../polymorphic";
import { createPresence } from "../primitives";
import { useCheckboxContext } from "./checkbox-context";
/**
 * The visual indicator rendered when the checkbox is in a checked or indeterminate state.
 * You can style this element directly, or you can use it as a wrapper to put an icon into, or both.
 */
export function CheckboxIndicator(props) {
    const formControlContext = useFormControlContext();
    const context = useCheckboxContext();
    props = mergeDefaultProps({
        id: context.generateId("indicator"),
    }, props);
    const [local, others] = splitProps(props, ["ref", "forceMount"]);
    const presence = createPresence(() => local.forceMount || context.indeterminate() || context.checked());
    return (<Show when={presence.isPresent()}>
      <Polymorphic as="div" ref={mergeRefs(presence.setRef, local.ref)} {...formControlContext.dataset()} {...context.dataset()} {...others}/>
    </Show>);
}