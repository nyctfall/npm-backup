"use strict";
// a NAND helper type:
/**
 * should take multiple types (currently two)
 * and then make sure all of values of the shared properties of the types are MUTUALLY EXCLUSIVE.
 *
 * It should also give more helpful Intelli-sence with TypeScript extentions.
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
/** @tests  */
/*
type t01 = FoundOptPropsHolder<{a: "1", b?: "2", c?: "3", d: "4"}>
type t02 = OptProps<{a: "1", b?: "2", c?: "3", d: "4"}>



type ads = NAND<{ toNo: boolean }, { toYes: boolean }, {toYes: false, toNo: false}>
// let wer1: ads = { toYes:true,toNo:true } // should error.
let wer2: ads = { toYes:false,toNo:true }
let wer3: ads = { toYes:true,toNo:false }
let wer4: ads = { toYes:false,toNo:false }
let wer5: ads = { toYes:true }
let wer6: ads = { toYes:false }
let wer7: ads = { toNo:false }
let wer8: ads = { toNo:true }



type ads0 = NAND<{ toNo: boolean, toYes?: false | never }, { toYes: boolean }, {toYes: false, toNo: false} >
// let wer01: ads0 = { toYes:true,toNo:true } // should error.
let wer02: ads0 = { toYes:false,toNo:true }
let wer03: ads0 = { toYes:true,toNo:false }
let wer04: ads0 = { toYes:false,toNo:false }
let wer05: ads0 = { toYes:true }
let wer06: ads0 = { toYes:false }
let wer07: ads0 = { toNo:false }
let wer08: ads0 = { toNo:true }


type ads00 = NAND<{ toNo: boolean, toYes?: false | never }, { toYes: boolean, toNo?: false | never }, {toYes: false, toNo: false} >
// let wer001: ads00 = { toYes:true,toNo:true } // should error.
let wer002: ads00 = { toYes:false,toNo:true }
let wer003: ads00 = { toYes:true,toNo:false }
let wer004: ads00 = { toYes:false,toNo:false }
let wer005: ads00 = { toYes:true }
let wer006: ads00 = { toYes:false }
let wer007: ads00 = { toNo:false }
let wer008: ads00 = { toNo:true }


 */
/*

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
let t6: t = { toNo: true, toYes: true } // <- should error

const tester = ({toYes, toNo }: t) => {
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
tester({toYes: false, toNo: true})
tester({toYes: true, toNo: false})
tester({toYes: false, toNo: false})



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

type m<T,U> = {
  a: Required<T> extends Required<U> ? true : false
  b: Partial<T> extends Required<U> ? true : false
  c: T extends Required<U> ? true : false
  d: Required<T> extends U ? true : false
  e: Partial<T> extends U ? true : false
  f: T extends U ? true : false
  g: Required<T> extends Partial<U> ? true : false
  h: Partial<T> extends Partial<U> ? true : false
  i: T extends Partial<U> ? true : false
}

type qw = m<{t?: true}, {t: true}>

type oa = oq<x2>
type oa2 = Complete<x2>

*/
//# sourceMappingURL=union-helper-types.js.map