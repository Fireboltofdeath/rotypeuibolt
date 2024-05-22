/**
 * Accesses a field from the component's state.
 *
 * This accepts both strings and numbers as names which means you can use ordinary numeric enums to represent your variables.
 */
export type Var<N extends string | number> = { _variable: N };

/**
 * Compares the `Cond` to true, and will return `Value` if so, otherwise it will return `Else`.
 */
export type If<Cond, Value, Else = undefined> = { _if: [Cond, Value, Else] };

/**
 * Compares the `Lhs` to the `Rhs` and returns a boolean.
 */
export type Eq<Lhs, Rhs> = { _eq: [Lhs, Rhs] };

/**
 * Generates a UI based on the inputted prompt, requires OpenAI setup.
 */
export type Ai<P extends string> = { _ai: P };
