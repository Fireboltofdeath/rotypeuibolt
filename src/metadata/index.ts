import { ExtractInstanceType, ExtractInstanceTypeName, UiInstances } from "./instances";

export type FieldVariableData =
	| ["udim2", FieldVariableData, FieldVariableData, FieldVariableData, FieldVariableData]
	| ["udim", FieldVariableData, FieldVariableData]
	| ["enum", string]
	| ["vector2", FieldVariableData, FieldVariableData]
	| ["color3", FieldVariableData, FieldVariableData, FieldVariableData]
	| ["variable", string]
	| ["if", FieldVariableData, FieldVariableData, FieldVariableData]
	| ["eq", FieldVariableData, FieldVariableData]
	| ["number", number]
	| ["string", string]
	| ["boolean", boolean]
	| ["undefined"]
	| ["instance", [keyof CreatableInstances, Record<string, FieldVariableData>]];

export type FieldData = ["signal", FieldVariableData] | ["field", FieldVariableData] | ["component", FieldVariableData];

type FieldVariableMetadata<T> = [T] extends [{ _datatype: [infer K, unknown, ...infer V] }]
	? [K, ...{ [k in keyof V]: FieldVariableMetadata<V[k]> }]
	: [T] extends [EnumItem]
	? ["enum", T["Name"]]
	: [T] extends [{ _variable: infer N }]
	? ["variable", N]
	: [T] extends [{ _if: [infer V, infer T, infer F] }]
	? ["if", FieldVariableMetadata<V>, FieldVariableMetadata<T>, FieldVariableMetadata<F>]
	: [T] extends [{ _eq: [infer Lhs, infer Rhs] }]
	? ["eq", FieldVariableMetadata<Lhs>, FieldVariableMetadata<Rhs>]
	: [T] extends [number]
	? ["number", T]
	: [T] extends [string]
	? ["string", T]
	: [T] extends [boolean]
	? ["boolean", T]
	: [T] extends [undefined]
	? ["undefined"]
	: [T] extends [Instance]
	? ["instance", InstanceMetadata<T>]
	: never;

type FieldMetadata<T, K extends keyof T> = T[K] extends RBXScriptSignal<Callback>
	? ["signal", FieldVariableMetadata<T[K]>]
	: K extends keyof ExtractInstanceType<T>
	? ["field", FieldVariableMetadata<T[K]>]
	: ["component", FieldVariableMetadata<T[K]>];

export type InstanceData = [keyof UiInstances, Record<string, FieldData | undefined>];

export type InstanceMetadata<T> = [
	ExtractInstanceTypeName<T>,
	{
		[k in keyof T]: k extends keyof ExtractInstanceType<T>
			? ExtractInstanceType<T>[k] extends T[k]
				? undefined
				: FieldMetadata<T, k>
			: FieldMetadata<T, k>;
	},
];
