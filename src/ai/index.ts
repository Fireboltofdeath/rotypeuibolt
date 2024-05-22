import { HttpService } from "@rbxts/services";

const AI_PROMPT = `You are acting as a UI library for Roblox.

The following is a list of supported datatypes and the type that you must generate.
Enums should be generated as strings, using the name of the EnumItem.

Color3: { red: number, green: number, blue: number }
UDim2: { xScale: number, xOffset: number, yScale: number, yOffset: number }
UDim: { scale: number, offset: number }
Vector2: { x: number, y: number }
string: string
number: number
boolean: boolean

All Roblox instance classes are supported, and should be generated in the following format:
{ className: string, properties: Record<string, DataType>, children: Array<Instance> }

The "properties" field specifies the properties that must be set and the value must be one of the supported datatypes, with a "type" field indicating the name of the datatype and a "value" field with the actual datatype.
Ensure the types provided in the "properties" field have the same type as the field in the Roblox API.

Please emit a JSON object detailing the UI and in the format of the Instance type.`;

interface CompletionResponse {
	choices: { message: { content: string } }[];
}

export function setupServerAi(apiKey: string, model = "gpt-3.5-turbo", temperature = 0) {
	const prompts = new Map<string, Promise<string>>();

	const remote = new Instance("RemoteFunction");
	remote.Name = "rotypeuibolt_OpenAI";
	remote.Parent = game.GetService("ReplicatedStorage");

	async function createPrompt(prompt: string) {
		const existingPrompt = prompts.get(prompt);
		if (existingPrompt) {
			return await existingPrompt;
		}

		const promise = new Promise<string>((resolve) => {
			const request = HttpService.RequestAsync({
				Url: "https://api.openai.com/v1/chat/completions",
				Method: "POST",
				Body: HttpService.JSONEncode({
					model,
					temperature,
					response_format: { type: "json_object" },
					messages: [
						{ role: "system", content: AI_PROMPT },
						{ role: "user", content: prompt },
					],
				}),
				Headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${apiKey}`,
				},
			});

			const response = HttpService.JSONDecode(request.Body) as CompletionResponse;
			resolve(response.choices[0].message.content);

			print(`Received design for prompt: "${prompt}"`);
		});

		prompts.set(prompt, promise);

		return await promise;
	}

	remote.OnServerInvoke = (_player, prompt: unknown) => {
		if (!typeIs(prompt, "string")) {
			return;
		}

		return createPrompt(prompt).expect();
	};
}
