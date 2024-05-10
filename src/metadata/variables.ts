import { Component } from "../component";
import { ExtractInstanceType, UiInstance } from "./instances";
import { Var } from "./state";

type InferVariables<C, Ctx> = [C] extends [Var<infer N>]
	? [N, Ctx]
	: [C] extends [UiInstance]
	? InferInstanceVariables<C>
	: [C] extends [{ _if: [infer C, infer T, infer F] }]
	? InferVariables<C, boolean> | InferVariables<T, Ctx> | InferVariables<F, Ctx>
	: [C] extends [{ _eq: [infer L, infer R] }]
	? InferVariables<L, unknown> | InferVariables<R, unknown>
	: [C] extends [{ _datatype: [string, infer Ctx, ...infer V] }]
	? { [k in keyof V]: InferVariables<V[k], Ctx> }[keyof V]
	: never;

type InstanceFieldContext<T, K extends keyof T> = [K] extends [keyof ExtractInstanceType<T>]
	? ExtractInstanceType<T>[K] extends RBXScriptSignal<infer C>
		? C | undefined
		: ExtractInstanceType<T>[K]
	: Component | Component[] | undefined;

type InferInstanceVariables<T> = {
	[k in keyof T]-?: InferVariables<T[k], InstanceFieldContext<T, k>>;
}[keyof T];

export type InferVariableState<T, V = InferInstanceVariables<T>> = Reconstruct<
	UnionToIntersection<V extends [string | number, unknown] ? Record<V[0], V[1]> : never>
>;
