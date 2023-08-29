/**
 * should take multiple types (currently two)
 * and then make sure all of values of the shared properties of the types are MUTUALLY EXCLUSIVE.
 *
 * It should also give more helpful Intelli-sence with TypeScript extentions.
 *
 */
/**
 * @summary Finds all Optional properties of a inteface type.
 * - goal: make an object that has properties that are the keys of optional properties of the T type.
 * - NOTE: also works with Symbol and number keys
 * - step 1): loop over the props of T: the optionality of the holder is removed, to not emit "undefined" as a false positive key of T when keyof is used.
 * - step 2): if the prop of T can be absent or undefined: then it's optional, which means it can't extend a required non-undefined prop.
 * - step 3): return the known optional prop of T as a value for the holder.
 * - step 4): return the known required prop of T never in the holder, so it won't be a false positive when listing it's value.
 * @example
 * type Exmpl = {a?: any, b: any, c?: any};
 * FoundOptPropHolder<Exmpl>; // <- equals Record<string|number|symbol,string|number|symbol|never> type:  { a: "a", b: never, c: "c" }
 */
declare type FoundOptPropsHolder<T> = {
    [P in keyof T]-?: Partial<Pick<T, P>> extends Pick<T, P> ? P : never;
};
/**
 * @summary Returns a union type of all the optional property keys of Object T.
 * @example
 * type Exmpl = {a?: any, b: any, c?: any};
 * OptProps<Exmpl>; // <- equals union type:  ("a" | "c")
 */
declare type OptProps<T> = FoundOptPropsHolder<T>[keyof T];
/**
 * @summary Create a union type that has mutually exclusive properites.
 */
declare type NAND_XOR_Half<T, U, RestrictOverlapKeys_WithXOR, OptProps_T extends keyof T> = Required<Omit<T, OptProps_T>> & {
    [P in OptProps_T | keyof U]+?: P extends keyof U ? P extends keyof T ? T[P] : P extends keyof RestrictOverlapKeys_WithXOR ? RestrictOverlapKeys_WithXOR[P] : U[P] : P extends keyof T ? T[P] : never;
};
export declare type NAND_XOR<T, U, RestrictOverlapKeys_WithXOR> = NAND_XOR_Half<T, U, RestrictOverlapKeys_WithXOR, OptProps<T>> | NAND_XOR_Half<U, T, RestrictOverlapKeys_WithXOR, OptProps<U>>;
declare type NAND_XOR_Helper<NAND_XOR_Half_T, NAND_XOR_Half_U> = {
    [P in keyof NAND_XOR_Half_T]: NAND_XOR_Half_T[P];
} | {
    [P in keyof NAND_XOR_Half_U]: NAND_XOR_Half_U[P];
};
export declare type NAND<T, U, RestrictOverlapKeys_WithXOR> = NAND_XOR_Helper<NAND_XOR_Half<T, U, RestrictOverlapKeys_WithXOR, OptProps<T>>, NAND_XOR_Half<U, T, RestrictOverlapKeys_WithXOR, OptProps<U>>>;
export {};
/** @tests  */
