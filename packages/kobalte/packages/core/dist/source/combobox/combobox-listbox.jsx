import { mergeDefaultProps, mergeRefs } from "@kobalte/utils";
import { createEffect, onCleanup, splitProps } from "solid-js";
import { useFormControlContext } from "../form-control";
import * as Listbox from "../listbox";
import { useComboboxContext } from "./combobox-context";
/**
 * Contains all the items of a `Combobox`.
 */
export function ComboboxListbox(props) {
    const formControlContext = useFormControlContext();
    const context = useComboboxContext();
    props = mergeDefaultProps({
        id: context.generateId("listbox"),
    }, props);
    const [local, others] = splitProps(props, ["ref"]);
    const ariaLabelledBy = () => {
        return formControlContext.getAriaLabelledBy(others.id, context.listboxAriaLabel(), undefined);
    };
    createEffect(() => onCleanup(context.registerListboxId(others.id)));
    return (<Listbox.Root ref={mergeRefs(context.setListboxRef, local.ref)} state={context.listState()} autoFocus={context.autoFocus()} shouldUseVirtualFocus shouldSelectOnPressUp shouldFocusOnHover aria-label={context.listboxAriaLabel()} aria-labelledby={ariaLabelledBy()} renderItem={context.renderItem} renderSection={context.renderSection} {...others}/>);
}