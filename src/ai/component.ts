import { Modding } from "@flamework/core";
import { HttpService, ReplicatedStorage } from "@rbxts/services";
import { Component } from "../component";
import { InstanceData, InstanceMetadata } from "../metadata";
import { New } from "../metadata/constructors";
import { Var } from "../metadata/state";
import { InstanceInput } from "./input";
import { revitalizeInput } from "./revitalize";

type AiComponent = Frame & {
	BackgroundTransparency: 1;
	Size: New.UDim2<1, 0, 1, 0>;

	rendered: Var<"component">;
};

export function createAiComponent(create: (state: object, metadata: InstanceData) => Component, prompt: string) {
	const remote = ReplicatedStorage.FindFirstChild("rotypeuibolt_OpenAI") as RemoteFunction | undefined;
	if (!remote) {
		error("server has not setup OpenAI");
	}

	const aiComponent = create({}, Modding.inspect<InstanceMetadata<AiComponent>>() as InstanceData);

	aiComponent.effect(() => {
		const thread = task.spawn(() => {
			const result = HttpService.JSONDecode(remote.InvokeServer(prompt)) as InstanceInput;
			aiComponent.updateState({
				component: create({}, revitalizeInput(result)),
			});
		});

		return () => task.cancel(thread);
	});

	return aiComponent;
}
