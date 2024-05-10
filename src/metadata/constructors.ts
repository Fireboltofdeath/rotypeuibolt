import { If, Var } from "./state";

type NumVarSimple = Var<string | number> | number;

// We can't have fully cylical types, so we pre-generate up to 5 depth.
type NumVar<T extends unknown[] = []> = T extends { length: 5 }
	? NumVarSimple | T[number]
	: NumVar<[...T, NumVarSimple | If<unknown, T[number], T[number]>]>;

export namespace New {
	/**
	 * Creates a new UDim2 with the same arguments as the default constructor.
	 */
	export type UDim2<XS extends NumVar, XO extends NumVar, YS extends NumVar, YO extends NumVar> = {
		_datatype: ["udim2", number, XS, XO, YS, YO];
	};
	export namespace UDim2 {
		/**
		 * Creates a new UDim2 using X and Y as offset.
		 */
		export type FromOffset<X extends NumVar, Y extends NumVar> = UDim2<0, X, 0, Y>;

		/**
		 * Creates a new UDim2 using X and Y as scale.
		 */
		export type FromScale<X extends NumVar, Y extends NumVar> = UDim2<X, 0, Y, 0>;
	}

	/**
	 * Creates a new UDim with the same arguments as the default constructor.
	 */
	export type UDim<S extends NumVar, O extends NumVar> = { _datatype: ["udim", number, S, O] };

	/**
	 * Creates a new Vector2 with the same arguments as the default constructor.
	 */
	export type Vector2<X extends NumVar, Y extends NumVar> = { _datatype: ["vector2", number, X, Y] };

	/**
	 * Creates a new Color3, using the `Color3.fromRGB` constructor which means the values must be 0-255.
	 */
	export type Color3<R extends NumVar, G extends NumVar, B extends NumVar> = {
		_datatype: ["color3", number, R, G, B];
	};
}
