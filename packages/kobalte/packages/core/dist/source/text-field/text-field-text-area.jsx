/*!
 * Portions of this file are based on code from react-spectrum.
 * Apache License Version 2.0, Copyright 2020 Adobe.
 *
 * Credits to the React Spectrum team:
 * https://github.com/adobe/react-spectrum/blob/0af91c08c745f4bb35b6ad4932ca17a0d85dd02c/packages/@react-aria/textfield/src/useTextField.ts
 * https://github.com/adobe/react-spectrum/blob/0af91c08c745f4bb35b6ad4932ca17a0d85dd02c/packages/@react-spectrum/textfield/src/TextArea.tsx
 */
import { composeEventHandlers, mergeDefaultProps, mergeRefs, } from "@kobalte/utils";
import { createEffect, on, splitProps } from "solid-js";
import { useTextFieldContext } from "./text-field-context";
import { TextFieldInputBase } from "./text-field-input";
/**
 * The native html textarea of the textfield.
 */
export function TextFieldTextArea(props) {
    let ref;
    const context = useTextFieldContext();
    props = mergeDefaultProps({
        id: context.generateId("textarea"),
    }, props);
    const [local, others] = splitProps(props, ["ref", "autoResize", "submitOnEnter", "onKeyPress"]);
    createEffect(on([() => ref, () => local.autoResize, () => context.value()], ([ref, autoResize]) => {
        if (!ref || !autoResize) {
            return;
        }
        adjustHeight(ref);
    }));
    const onKeyPress = (event) => {
        if (ref && local.submitOnEnter && event.key === "Enter" && !event.shiftKey) {
            if (ref.form) {
                ref.form.requestSubmit();
                event.preventDefault();
            }
        }
    };
    return (<TextFieldInputBase as="textarea" aria-multiline={local.submitOnEnter ? "false" : undefined} onKeyPress={composeEventHandlers([local.onKeyPress, onKeyPress])} ref={mergeRefs(el => (ref = el), local.ref)} {...others}/>);
}
/**
 * Adjust the height of the textarea based on its text value.
 */
function adjustHeight(el) {
    const prevAlignment = el.style.alignSelf;
    const prevOverflow = el.style.overflow;
    // Firefox scroll position is lost when `overflow: 'hidden'` is applied, so we skip applying it.
    // The measure/applied height is also incorrect/reset if we turn on and off
    // overflow: hidden in Firefox https://bugzilla.mozilla.org/show_bug.cgi?id=1787062
    const isFirefox = "MozAppearance" in el.style;
    if (!isFirefox) {
        el.style.overflow = "hidden";
    }
    el.style.alignSelf = "start";
    el.style.height = "auto";
    // offsetHeight - clientHeight accounts for the border/padding.
    el.style.height = `${el.scrollHeight + (el.offsetHeight - el.clientHeight)}px`;
    el.style.overflow = prevOverflow;
    el.style.alignSelf = prevAlignment;
}