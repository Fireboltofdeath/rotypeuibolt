type UDim2Input = { xScale: number; xOffset: number; yScale: number; yOffset: number };
type UDimInput = { scale: number; offset: number };
type Color3Input = { red: number; green: number; blue: number };
type Vector2Input = { x: number; y: number };

export type DataTypeInput =
	| { type: "UDim2"; value: UDim2Input }
	| { type: "UDim"; value: UDimInput }
	| { type: "Color3"; value: Color3Input }
	| { type: "Vector2"; value: Vector2Input }
	| { type: "string"; value: string }
	| { type: "number"; value: number }
	| { type: "boolean"; value: boolean };

export type InstanceInput = {
	className: string;
	properties: Record<string, DataTypeInput>;
	children: Array<InstanceInput>;
};
