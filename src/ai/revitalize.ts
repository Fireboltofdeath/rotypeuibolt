import { FieldVariableData, InstanceData } from "../metadata";
import { DataTypeInput, InstanceInput } from "./input";

function generateDataType(value: DataTypeInput): FieldVariableData {
	if (value.type === "string") {
		return ["string", value.value];
	} else if (value.type === "number") {
		return ["number", value.value];
	} else if (value.type === "boolean") {
		return ["boolean", value.value];
	} else if (value.type === "UDim2") {
		return [
			"udim2",
			["number", value.value.xScale],
			["number", value.value.xOffset],
			["number", value.value.yScale],
			["number", value.value.yOffset],
		];
	} else if (value.type === "UDim") {
		return ["udim", ["number", value.value.scale], ["number", value.value.offset]];
	} else if (value.type === "Color3") {
		return [
			"color3",
			["number", value.value.red * 255],
			["number", value.value.green * 255],
			["number", value.value.blue * 255],
		];
	} else if (value.type === "Vector2") {
		return ["udim", ["number", value.value.x], ["number", value.value.y]];
	} else {
		error(`Unexpected datatype: ${value["type"]}`);
	}
}

export function revitalizeInput(input: InstanceInput): InstanceData {
	const data = [input.className, {}] as InstanceData;

	for (const [key, value] of pairs(input.properties)) {
		data[1][key] = ["field", generateDataType(value)];
	}

	for (let i = 0; i < input.children.size(); i++) {
		data[1][`child-${i}`] = ["component", ["instance", revitalizeInput(input.children[i])]];
	}

	return data;
}
