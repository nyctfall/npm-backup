// a NAND helper type:
/**
 * should take multiple types (currently two)
 * and then make sure all of values of the shared properties of the types are MUTUALLY EXCLUSIVE.
 *
 * It should also give more helpful Intelli-sence with TypeScript extentions.
 *
 */
let wer = { toYes: true };
let t1 = { toNo: false };
let t2 = { toYes: false };
let t8 = { toNo: true };
let t7 = { toYes: true };
let t3 = { toYes: false, toNo: false };
let t4 = { toYes: true, toNo: false };
let t5 = { toNo: false, toYes: false };
let t6 = { toNo: true, toYes: true }; // <- should error
const tester = ({ toYes, toNo }) => {
    let t1 = { toNo };
    let t2 = { toYes };
    let t3 = { toNo: !toNo };
    let t4 = { toYes: !toYes };
    // let t7: t = { toYes: a, toNo: b } // <- shouldn't give error.
    let t5 = { toYes, toNo }; // ...best fix so far.
    // let t8: t = { toNo: b, toYes: a }
    let t6 = { toNo, toYes };
};
// test({toYes: true, toNo: true}) // <- should give error.
tester({ toYes: false, toNo: true });
tester({ toYes: true, toNo: false });
tester({ toYes: false, toNo: false });
let w = { same: true };
let tt = { y: true, n: true };
