import { Modding } from "@flamework/core";
import { Component } from "./component";
import { create } from "./create";
import { InstanceData, InstanceMetadata } from "./metadata";
import { New } from "./metadata/constructors";
import { UiInstance } from "./metadata/instances";
import { Eq, If, Var } from "./metadata/state";
import { InferVariableState } from "./metadata/variables";

/**
 * Creates a new component from a TypeScript type.
 *
 * The initial state must be provided and can be updated using the returned component instance.
 *
 * @metadata macro
 */
export function component<T extends UiInstance>(
	state: InferVariableState<T>,
	meta?: Modding.Many<InstanceMetadata<T>>,
) {
	assert(meta);

	return create(state, meta as InstanceData) as Component<T>;
}

export { Component, Eq, If, New, Var };
