import { UiInstance } from "./metadata/instances";
import { InferVariableState } from "./metadata/variables";

export type Component<T extends UiInstance = UiInstance> = {
	/**
	 * Updates the state of the component and causes the UI to rerender.
	 *
	 * The generic here is a hack to avoid a contravariant position for `T` which complicates
	 * assignment for variables.
	 */
	updateState: <S extends InferVariableState<T>>(state: S) => void;

	/**
	 * This is the same as `updateState`, except it accepts a partial state which will be applied.
	 *
	 * If you need to set a field to undefined, you must use `updateState`.
	 */
	patchState: (state: Partial<InferVariableState<T>>) => void;

	/**
	 * Returns the underlying Instance.
	 */
	getInstance: () => T | undefined;

	/**
	 * Returns the current state of the component.
	 */
	getState: () => InferVariableState<T>;

	/**
	 * Allows your component to have side effects on mount and unmount, such as connecting to signals.
	 */
	effect: (callback: () => (() => void) | undefined) => void;

	/**
	 * Mounts this component onto an instance, triggering any effects.
	 */
	mount: (parent: Instance) => void;

	/**
	 * Unmounts this component, triggering any effect cleanup functions.
	 */
	unmount: () => void;

	/**
	 * This determines whether this component should share state with its parent.
	 *
	 * @internal
	 */
	isNestedInstance: boolean;
};
