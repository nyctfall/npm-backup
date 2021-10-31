// a NAND helper type:
/**
 * should take multiple types (currently two)
 * and then make sure all of values of the shared properties of the types are MUTUALLY EXCLUSIVE.
 * 
 * It should also give more helpful Intelli-sence with TypeScript extentions.
 * 
 */

// // OLDEST VERSION:
// // type NAND<T, U> = {
// //   [P in keyof T]: P extends keyof U ? T[P] : U[keyof U]
// // } | {
// //   [P in keyof U]: P extends keyof T ? U[P] : T[keyof T]
// // }
// OLD VERSION:
// type NAND_XOR<T, U, RestrictOverlapKeys_WithXOR> = {
//   [P in keyof T | keyof U]: // Checks all property keys of both types T and U: (string, number, and Symbol)
//     P extends keyof U // Check if the property is in type U
//       ? P extends keyof T // Check if the property is ALSO in type T
//         ? T[P] // If property is in both type T and U, it must be mutually exclusive. In this half the type of property in T takes precedence
//         : P extends keyof RestrictOverlapKeys_WithXOR // Since T doesn't have the property, return the property from U as it should be in T, as enumerated in the list of keys to prevent overlap
//           ? RestrictOverlapKeys_WithXOR[P] // If certain properties FROM U should have a certain value in T, use the value specified
//           : U[P] // This property FROM U, IS ALLOWED to be added to T in a UNION
//       : P extends keyof T // The property IS in type T, here just to satasfy syntax, since just having `: T[P]` will give an error: "Type 'P' cannot be used to index type 'T'. ts(2536)"
//         ? T[P] // Return property, as it's exclusive to ONLY T
//         : Error & never // unused, as it should NEVER happen that a property FROM U or T, isn't IN U or T. But it's there to satify the syntax
// } | {
//   [P in keyof U | keyof T]: // Checks all property keys of both types U and T: (string, number, and Symbol)
//     P extends keyof T // Check if the property is in type T
//       ? P extends keyof U // Check if the property is ALSO in type U
//         ? U[P] // If property is in both type U and T, it must be mutually exclusive. In this half the type of property in U takes precedence
//         : P extends keyof RestrictOverlapKeys_WithXOR // Since U doesn't have the property, return the property from T as it should be in U, as enumerated in the list of keys to prevent overlap
//           ? RestrictOverlapKeys_WithXOR[P] // If certain properties FROM T should have a certain value in U, use the value specified
//           : T[P] // This property FROM T, IS ALLOWED to be added to U in a UNION
//       : P extends keyof U // The property IS in type U, here just to satasfy syntax, since just having `: U[P]` will give an error: "Type 'P' cannot be used to index type 'U'. ts(2536)"
//         ? U[P] // Return property, as it's exclusive to ONLY U
//         : Error & never // unused, as it should NEVER happen that a property FROM T or U, isn't IN T or U. But it's there to satify the syntax
// }


type NAND_XOR<T, U, RestrictOverlapKeys_WithXOR> = {
  [P in keyof T | keyof U]: // Checks all property keys of both types T and U: (string, number, and Symbol)
    P extends keyof U // Check if the property is in type U
      ? P extends keyof T // Check if the property is ALSO in type T
        ? T[P] // If property is in both type T and U, it must be mutually exclusive. In this half the type of property in T takes precedence
        : P extends keyof RestrictOverlapKeys_WithXOR // Since T doesn't have the property, return the property from U as it should be in T, as enumerated in the list of keys to prevent overlap
          ? RestrictOverlapKeys_WithXOR[P] // If certain properties FROM U should have a certain value in T, use the value specified
          : U[P] // This property FROM U, IS ALLOWED to be added to T in a UNION
      : P extends keyof T // The property IS in type T, here just to satasfy syntax, since just having `: T[P]` will give an error: "Type 'P' cannot be used to index type 'T'. ts(2536)"
        ? T[P] // Return property, as it's exclusive to ONLY T
        : Error & never // unused, as it should NEVER happen that a property FROM U or T, isn't IN U or T. But it's there to satify the syntax
} | {
  [P in keyof U | keyof T]: // Checks all property keys of both types U and T: (string, number, and Symbol)
    P extends keyof T // Check if the property is in type T
      ? P extends keyof U // Check if the property is ALSO in type U
        ? U[P] // If property is in both type U and T, it must be mutually exclusive. In this half the type of property in U takes precedence
        : P extends keyof RestrictOverlapKeys_WithXOR // Since U doesn't have the property, return the property from T as it should be in U, as enumerated in the list of keys to prevent overlap
          ? RestrictOverlapKeys_WithXOR[P] // If certain properties FROM T should have a certain value in U, use the value specified
          : T[P] // This property FROM T, IS ALLOWED to be added to U in a UNION
      : P extends keyof U // The property IS in type U, here just to satasfy syntax, since just having `: U[P]` will give an error: "Type 'P' cannot be used to index type 'U'. ts(2536)"
        ? U[P] // Return property, as it's exclusive to ONLY U
        : Error & never // unused, as it should NEVER happen that a property FROM T or U, isn't IN T or U. But it's there to satify the syntax
} 

type NAND<T, U> = NAND_XOR<T, U, null>

interface No { toNo: boolean, toYes?: false | never }
interface Yes { toYes: boolean, toNo?: false | never }

type t = NAND<No, Yes>

type u = NAND<{cat: true}, {dog: true}> // <- BAD VERSION
type u2 = NAND_XOR<{cat: true}, {dog: true}, {dog:never,cat:never}> // <- FIXED VERSION!! ...almost

let t1: t = { toNo: false }
let t2: t = { toYes: false }
let t8: t = { toNo: true }
let t7: t = { toYes: true }
let t3: t = { toYes: false, toNo: false }
let t4: t = { toYes: true, toNo: false }
let t5: t = { toNo: false, toYes: false }
// let t6: t = { toNo: true, toYes: true } // <- should error

const test = ({toYes, toNo }: t) => {
  let t1: t = { toNo }
  let t2: t = { toYes }
  let t3: t = { toNo: !toNo }
  let t4: t = { toYes: !toYes }
  // let t7: t = { toYes: a, toNo: b } // <- shouldn't give error.
  let t5: t = { toYes, toNo } as t // ...best fix so far.
  // let t8: t = { toNo: b, toYes: a }
  let t6: t = { toNo, toYes } as t
}

// test({toYes: true, toNo: true}) // <- should give error.
test({toYes: false, toNo: true})
test({toYes: true, toNo: false})
test({toYes: false, toNo: false})




















// TESTING: ...







interface z1 {string?: "z1"}
interface z2 {string?: "z2"}

type a<T,U> = {
  [P in keyof T | keyof U]: P extends (keyof T | keyof U) ? P extends keyof U ? U[P] : T[keyof T] : "ERROR"
}

type b<T> = {
  [P in keyof Required<T>]: T[P]
}

type c = {
  [P in keyof Required<z1>]: z1[P]
}

type d<T extends z1> = {
  [P in keyof z1]: T[keyof T]
}

type e<T,U> = {
  [P in keyof U]: T[keyof T]
}

type z3 = a<z1,z2>
type z4 = b<z1>
type z5 = c
type z6 = d<{string: "a"}>
type z7 = e<z1, z2>

type x1 = {
  a: "x1"
  b: true
  same: true
}
type x2 = {
  a?: "x2"
  b?: false
  same: true
}

type x3 = x1 | x2
type x4 = x1 & x2
type x5 = {
  a: "x1"
  b: true
  same: true
} | {
  a?: "x2"
  b?: false
  same: true
}

let w: x5 = {same: true} 

type q = {
  [P in keyof x5]: x3[P]
}

type Complete<T> = {
  [P in keyof Required<T>]: Pick<T, P> extends Required<Pick<T, P>> ? "T[P]" : "(T[P] | undefined)";
}

type ss<T> = Pick<T, keyof Required<Pick<T, keyof T>>>
type za = ss<x2>
type ww = Complete<x2>

type qq = {n: boolean} & {y?: false}
type aa = {y: boolean} & {n?: false}
type xx = qq | aa
let tt: xx = {y: true, n: true}


type oo<T,U> = {
  // todo mapped type union test, Partial<T|U>
  [P in keyof Partial<T|U>]: P extends keyof T ? T[P] : U[P]
} & {
  // todo mapped type union test, Require<T|U>
  [P in keyof Required<T|U>]: P extends keyof T ? T[P] : U[P]
}

type ot = oo<x1,x2>

type oq<T> = {
  [P in keyof Partial<T>]: Pick<T,P> extends keyof Partial<Pick<T,P>> ? P : 'doesn\'t'
}

type m<T,P> = {
  a: Required<T> extends Required<P> ? true : false
  b: Partial<T> extends Required<P> ? true : false
  c: T extends Required<P> ? true : false
  d: Required<T> extends P ? true : false
  e: Partial<T> extends P ? true : false
  f: T extends P ? true : false
  g: Required<T> extends Partial<P> ? true : false
  h: Partial<T> extends Partial<P> ? true : false
  i: T extends Partial<P> ? true : false
}

type qw = m<{t?: true}, {t: true}>

type oa = oq<x2>
type oa2 = Complete<x2>