# @rbxts/rotypeuibolt
This is a next generation, super modern and highly declarative user interface library. It uses a revolutionary and concise IDL called TypeScript types which allows you to focus on designing your UI, not writing code.

[This library requires Flamework to be installed.](https://flamework.fireboltofdeath.dev/docs/installation#installing-flamework)

## Documentation

At its core, rotypeuibolt is very simple as we've simply uplifted the code you'd usualy write into TypeScript types!
- Want to access state? `Var<"variable">`
- Want to compare values? `Eq<Var<"variable">, "open">`
- Want to render a component conditionally? `If<Var<"visible">, Frame, undefined>`
- Want to create a new UDim2? `New.UDim2<XS, XO, YS, YO>`
- Want to create a new Vector2? `New.Vector2<X, Y>`
- Want to create a new Color3? `New.Color3<R, G, B>`

Not to mention, all variables are strongly typed! If you use a variable, it will automatically enforce the correct types thanks to the amazing type safety of TypeScript types!

### Demo App

As an example, here's a basic `DemoApp` component which conditionally renders a rainbow frame!

```ts
import { component, type If, type New, type Var } from "@rbxts/flamework-binary-serializer";

// You could use strings or numbers directly in the `Var` type, but this helps prevent typos.
const enum AppVariables {
	Visible,
	Color,
}

type DemoApp = ScreenGui & {
	IgnoreGuiInset: true;

	myFrame: If<
		Var<AppVariables.Visible>,
		Frame & {
			Size: New.UDim2<1, 0, 1, 0>;
			BackgroundColor3: Var<AppVariables.Color>;
		},
		undefined
	>;
};

export function DemoApp() {
	const ui = component<DemoApp>({
		[AppVariables.Visible]: true,
		[AppVariables.Color]: new Color3(),
	});

	ui.effect(() => {
		let lastUpdate = os.time();

		const heartbeat = game.GetService("RunService").Heartbeat.Connect((dt) => {
			if (lastUpdate !== os.time()) {
				lastUpdate = os.time();

				const currentState = ui.getState();
				ui.patchState({
					[AppVariables.Visible]: !currentState[AppVariables.Visible],
					[AppVariables.Color]: BrickColor.random().Color,
				});
			}
		});

		return () => heartbeat.Disconnect();
	});

	return ui;
}
```

### Components

We also support creating and reusing components using very simple functions.

```ts
type Button = Frame & {
	Size: New.UDim2<0, 150, 0, 25>;
}

function Button() {
	return component<Button>({})
}

type MyApp = ScreenGui & {
	uilistlayout: UIListLayout;
	button: Var<"button">,
	buttons: Var<"buttons">,
	optionalButton: Var<"optionalButton">,

	// Alternatively, if your `Button` component is not stateful (i.e does not use `Var`),
	// you can also just reference the `Button` type directly!
	rawButton: Button,
}

function MyApp() {
	const myApp = component<MyApp>({
		// Specify a single component,
		button: Button(),

		// or specify multiple,
		buttons: [Button(), Button()],

		// or specify none!
		optionalButton: undefined,
	});

	return myApp;
}
```

### Mounting

You can mount components by manually calling `component.mount(instance)`. You should only do this for your root components (e.g `MyApp` or `DemoApp`) as `rotypeuibolt` will mount nested components automatically.

```ts
const app = DemoApp();

app.mount(game.GetService("Players").LocalPlayer.WaitForChild("PlayerGui"));
```

### Events

You can connect to events on instances simply by referencing a variable!

These connections will automatically be disconnected when unmounted, and you can even use conditionals like `If<Var<"enabled">, Var<"activated">, Var<"activatedWhileDisabled">>`

```ts
type Button = TextButton & {
	Activated: Var<"activated">;
}

const button = component<Button>({
	activated: () => {
		print("button pressed!")
	}
})
```

### Side effects

Sometimes, your UI needs to have side effects outside of events (such as connecting to `RunService` events) and `rotypeuibolt` supports this using the `component.effect` method.

The `component.effect` method takes a callback which will be called *when the component is mounted* and the callback can return a function which will be called *when the component is unmounted*.

If you have any state outside of an `effect`, it *must* be set in your `effect` callback as components can be reused or remounted.

```ts
const app = component<ScreenGui>({});

app.effect(() => {
	const connection = RunService.Heartbeat.Connect(() => {
		// Do stuff!
		app.updateState({});
	});

	return () => connection.Disconnect();
});
```

### AI-based UI creator

As an AI startup, we are revolutionizing the digital interface landscape with our cutting-edge AI-based UI creator. Leveraging state-of-the-art machine learning algorithms and neural network architectures, our platform autonomously generates user interfaces with unparalleled efficiency and creativity. By harnessing the power of deep learning, our AI intuitively understands user requirements, seamlessly translating abstract ideas into visually stunning and highly functional graphical interfaces.

Our proprietary algorithms analyze user behavior patterns, aesthetic preferences, and interaction data to tailor each UI to the unique needs of every project. Whether you're designing a minimalist dashboard or an intricate, multi-layered application, our AI-driven solution guarantees pixel-perfect precision and dynamic adaptability. With real-time feedback loops and continuous learning capabilities, our system evolves with every iteration, ensuring that your interfaces are always at the forefront of innovation.

Experience the future of design today with our AI-based UI creator, where machine intelligence meets artistic genius to transform your visions into reality effortlessly.

```ts
type MyApp = ScreenGui & {
	button: Ai<"Create a red button with the text DELETE, with a size of 300x200 pixels and a blue outline.">
}
```

#### Setup

The use of `rotypeuibolt`'s AI features require a valid OpenAI API key. You can create an API key [here](https://platform.openai.com/api-keys) if you have an OpenAI account.

Inside of a server script, you will want to call the `setupServerAi` function with your API key which will setup remote functions for the client to invoke. You can also optionally provide the `model` and `temperature` parameters.

The `temperature` controls the randomness of the input, it is set to zero by default.

```ts
// Default setup, using gpt-3.5-turbo with temperature set to zero.
setupServerAi("YOUR_SECRET_KEY");

// Smarter setup but more expensive, using gpt-4o with temperature set to zero.
setupServerAi("YOUR_SECRET_KEY", "gpt-4o");

// Smarter setup and more random, using gpt-4o with temperature set to one.
setupServerAi("YOUR_SECRET_KEY", "gpt-4o", 1);
```

## Disclaimer

Due to the revolutionary nature of this project, the fundamental design (such as state management, components and so on) is subject to change as we experiment with new and revolutionary ways to improve the design.

Use at your own risk.
