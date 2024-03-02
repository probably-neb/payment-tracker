/*!
 * Portions of this file are based on code from react-spectrum.
 * Apache License Version 2.0, Copyright 2020 Adobe.
 *
 * Credits to the React Spectrum team:
 * https://github.com/adobe/react-spectrum/blob/3155e4db7eba07cf06525747ce0adb54c1e2a086/packages/@react-aria/checkbox/src/useCheckbox.ts
 */
import { OverrideComponentProps, ValidationState } from "@kobalte/utils";
import { Accessor, JSX } from "solid-js";
interface CheckboxRootState {
    /** Whether the checkbox is checked or not. */
    checked: Accessor<boolean>;
    /** Whether the checkbox is in an indeterminate state. */
    indeterminate: Accessor<boolean>;
}
export interface CheckboxRootOptions {
    /** The controlled checked state of the checkbox. */
    checked?: boolean;
    /**
     * The default checked state when initially rendered.
     * Useful when you do not need to control the checked state.
     */
    defaultChecked?: boolean;
    /** Event handler called when the checked state of the checkbox changes. */
    onChange?: (checked: boolean) => void;
    /**
     * Whether the checkbox is in an indeterminate state.
     * Indeterminism is presentational only.
     * The indeterminate visual representation remains regardless of user interaction.
     */
    indeterminate?: boolean;
    /**
     * The value of the checkbox, used when submitting an HTML form.
     * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefvalue).
     */
    value?: string;
    /**
     * The name of the checkbox, used when submitting an HTML form.
     * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname).
     */
    name?: string;
    /** Whether the checkbox should display its "valid" or "invalid" visual styling. */
    validationState?: ValidationState;
    /** Whether the user must check the checkbox before the owning form can be submitted. */
    required?: boolean;
    /** Whether the checkbox is disabled. */
    disabled?: boolean;
    /** Whether the checkbox is read only. */
    readOnly?: boolean;
    /**
     * The children of the checkbox.
     * Can be a `JSX.Element` or a _render prop_ for having access to the internal state.
     */
    children?: JSX.Element | ((state: CheckboxRootState) => JSX.Element);
}
export interface CheckboxRootProps extends OverrideComponentProps<"div", CheckboxRootOptions> {
}
/**
 * A control that allows the user to toggle between checked and not checked.
 */
export declare function CheckboxRoot(props: CheckboxRootProps): JSX.Element;
export {};