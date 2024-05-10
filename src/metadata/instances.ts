// We don't use the entire CreatableInstances interface because it is large and TypeScript gets unhappy!
// (even more than it already does)
export type UiInstances = ExtractMembers<CreatableInstances, GuiBase2d | UIBase>;

export type UiInstance = UiInstances[keyof UiInstances];

export type ExtractInstanceTypeName<T> = [T] extends [Instance]
	? { [k in keyof UiInstances]: [T] extends [UiInstances[k]] ? k : never }[keyof UiInstances]
	: never;

export type ExtractInstanceType<T> = [T] extends [Instance] ? UiInstances[ExtractInstanceTypeName<T>] : never;
