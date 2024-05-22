import { createAiComponent } from "./ai/component";
import { Component } from "./component";
import { FieldVariableData, InstanceData } from "./metadata";

type DependencySet = Set<string | number>;

function computeFieldValue(
	state: object,
	field: FieldVariableData,
	instanceCache: Map<FieldVariableData, Component>,
	dependencies: DependencySet,
): unknown {
	const kind = field[0];

	if (kind === "variable") {
		dependencies.add(field[1]);
		return state[field[1] as never];
	} else if (kind === "udim2") {
		return new UDim2(
			computeFieldValue(state, field[1], instanceCache, dependencies) as number,
			computeFieldValue(state, field[2], instanceCache, dependencies) as number,
			computeFieldValue(state, field[3], instanceCache, dependencies) as number,
			computeFieldValue(state, field[4], instanceCache, dependencies) as number,
		);
	} else if (kind === "udim") {
		return new UDim(
			computeFieldValue(state, field[1], instanceCache, dependencies) as number,
			computeFieldValue(state, field[2], instanceCache, dependencies) as number,
		);
	} else if (kind === "enum") {
		// This is a string since it is simplest to implement but it will get coerced into an enum.
		return field[1];
	} else if (kind === "vector2") {
		return new Vector2(
			computeFieldValue(state, field[1], instanceCache, dependencies) as number,
			computeFieldValue(state, field[2], instanceCache, dependencies) as number,
		);
	} else if (kind === "color3") {
		return Color3.fromRGB(
			computeFieldValue(state, field[1], instanceCache, dependencies) as number,
			computeFieldValue(state, field[2], instanceCache, dependencies) as number,
			computeFieldValue(state, field[3], instanceCache, dependencies) as number,
		);
	} else if (kind === "string") {
		return field[1];
	} else if (kind === "number") {
		return field[1];
	} else if (kind === "boolean") {
		return field[1];
	} else if (kind === "undefined") {
		return undefined;
	} else if (kind === "instance") {
		const cached = instanceCache.get(field);
		if (cached) {
			return cached;
		}

		const component = create(state, field[1] as never);
		component.isNestedInstance = true;
		instanceCache.set(field, component);

		return component;
	} else if (kind === "if") {
		if (computeFieldValue(state, field[1], instanceCache, dependencies) === true) {
			return computeFieldValue(state, field[2], instanceCache, dependencies);
		} else {
			return computeFieldValue(state, field[3], instanceCache, dependencies);
		}
	} else if (kind === "eq") {
		return (
			computeFieldValue(state, field[1], instanceCache, dependencies) ===
			computeFieldValue(state, field[2], instanceCache, dependencies)
		);
	} else if (kind === "ai") {
		const cached = instanceCache.get(field);
		if (cached) {
			return cached;
		}

		const component = createAiComponent(create, field[1]);
		instanceCache.set(field, component);

		return component;
	}
}

export function create(defaultState: object, metadata: InstanceData): Component {
	const instance = new Instance(metadata[0]);
	const effects = new Array<() => (() => void) | undefined>();
	const dependencies = new Map<string, DependencySet>();
	const effectCleanup = new Array<() => void>();
	const signalConnections = new Map<string, RBXScriptConnection>();
	const nestedComponents = new Map<string, Component[]>();
	const previouslyResolved = new Map<string, unknown>();

	// Caches the nested instances so that we don't have to recreate them on every state change.
	const instanceCache = new Map<FieldVariableData, Component>();

	let currentState = defaultState;

	function updateState(state: object) {
		const previousState = currentState;
		currentState = state;

		for (const [key, data] of pairs(metadata[1])) {
			const knownDependencies = dependencies.get(key);

			// If none of the dependencies have changed, don't compute a new value.
			if (knownDependencies) {
				let isChanged = false;

				for (const dependency of knownDependencies) {
					if (currentState[dependency as never] !== previousState[dependency as never]) {
						isChanged = true;
						break;
					}
				}

				if (!isChanged) {
					continue;
				}
			}

			const newDependencies: DependencySet = new Set();
			const value = computeFieldValue(currentState, data[1], instanceCache, newDependencies);
			dependencies.set(key, newDependencies);

			// The value of this field hasn't changed, so we don't need to perform extra work.
			// We still update the dependencies above as the path to this value *could* have changed, affecting the dependencies.
			if (previouslyResolved.get(key) === value) {
				continue;
			}

			const kind = data[0];
			if (kind === "signal") {
				signalConnections.get(key)?.Disconnect();

				if (value !== undefined) {
					const connection = (instance[key as never] as RBXScriptSignal).Connect(value as Callback);
					signalConnections.set(key, connection);
				}
			} else if (kind === "component") {
				const componentsValue = (value as Component | Component[] | undefined) ?? [];
				const components = "isNestedInstance" in componentsValue ? [componentsValue] : componentsValue;
				const previousComponents = nestedComponents.get(key) ?? [];

				for (const component of previousComponents) {
					if (!components.includes(component)) {
						component.unmount();
					}
				}

				for (const component of components) {
					if (!previousComponents.includes(component)) {
						component.mount(instance);
					}
				}

				nestedComponents.set(key, components);
			} else if (kind === "field") {
				instance[key as never] = value as never;
			}

			previouslyResolved.set(key, value);
		}

		// Update the state of any children.
		for (const [_, components] of nestedComponents) {
			for (const component of components) {
				if (component.isNestedInstance) {
					component.updateState(currentState);
				}
			}
		}
	}

	function mount(parent: Instance) {
		if (instance.Parent === parent) {
			return;
		}

		if (instance.Parent !== undefined) {
			cleanup();
		}

		instance.Parent = parent;

		updateState(defaultState as never);

		for (const effect of effects) {
			const cleanup = effect();
			if (cleanup) {
				effectCleanup.push(cleanup);
			}
		}
	}

	function unmount() {
		instance.Parent = undefined;

		cleanup();
	}

	function cleanup() {
		for (const [_, components] of nestedComponents) {
			for (const component of components) {
				component.unmount();
			}
		}

		for (const cleanup of effectCleanup) {
			cleanup();
		}

		for (const [_, connection] of signalConnections) {
			connection.Disconnect();
		}

		effectCleanup.clear();
		signalConnections.clear();
		nestedComponents.clear();
		previouslyResolved.clear();
		dependencies.clear();
	}

	return {
		getInstance: () => instance,
		getState: () => currentState,
		effect: (callback) => effects.push(callback),
		patchState: (state) => updateState({ ...currentState, ...state }),
		mount,
		unmount,
		updateState,
		isNestedInstance: false,
	};
}
