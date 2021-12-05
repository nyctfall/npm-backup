import { describe, test, /* expect */ } from "@jest/globals"
// import * as cli from "../src-ts/arg-parse"
/* const cli = {
  verifyOptions: jest.fn((str: string) => {
    return [...str.matchAll(/(--\w+(?<=[= ])([\w-]+))|(-[a-zA-Z\d]+)/g)]
  })
} */
// console.log(cli.verifyOptions("-fny -D -B --dry-run --fun=super --party time"))
// console.log(cli.verifyOptions("-DB"))
// console.log(cli.verifyOptions("--dry-run"))
// console.log(cli.verifyOptions("--fun=super"))
// console.log(cli.verifyOptions("--party time"))


/**
 * @fileoverview - Test the CLI that will be the front-end that's exposed to the user.
 * 
 * - For version parsing the SemVer package that NPM uses, will be used for the CLI.
 * - Fuzz-testing should be used to find any bugs or vulnerablities in the CLI.
 * - Ensure all of the valid options and syntax in `npm install` is valid and functional in the CLI.
 *  common options:
 *  - [-P|--save-prod|-D|--save-dev|-O|--save-optional|--save-peer]
 *  - [-E|--save-exact]
 *  - [-B|--save-bundle]
 *  - [--no-save]
 *  - [--dry-run]
 */



/** @summary - inclusive random int generator */
function randInt(max: number): number
function randInt(min: number, max: number): number
function randInt(minOrMax: number, max?: number): number {
  // infer the value of min is the default 0:
  let min = 0

  // determine if only one arg was given to just specify the max of the range:
  if (typeof max === "number") {
    // min and max values of range were given:
    min = Math.ceil(minOrMax)
    max = Math.floor(max)
  }
  else {
    // use the only arg received as the max:
    max = Math.floor(minOrMax)
  }

  return Math.floor(Math.random() * (max - min + 1) + min)
}


/** @summary - the fuzzing test input string generator */
const fuzzGibberish = (maxStrLen = 1000, useAllUnicode = false, useOnlyPrintableASCII = false, useOnlyAlphaNum = false): string => {
  // gibberish ASCII or unicode string:
  let randStr = ""

  // max string length:
  const strLen = randInt((maxStrLen < 1) ? 0 : 1, maxStrLen)

  // set max char set value:
  const maxCodePoint = (useAllUnicode) ? 0x10FFFF : 0x7F

  // produce a random ASCII or Unicode character sequence:
  // Unicode: U+0000 through U+10FFFF (base16),
  //   U+D800 through U+DFFF,  are used to encode surrogate pairs in UTF-16.
  // ASCII: 0x00 through 0x7F, codes 0x20 to 0x7E, are known as the printable characters,
  //   ASCII reserves the first 32 codes (0x00 through 0x1F) and 0x7F for control characters.
  for (let i = 0; i < strLen; i++){
    if (useOnlyPrintableASCII && useOnlyAlphaNum){
      const rand1in3 = Math.random() * 3

      if (rand1in3 < 1){
        // ASCII codes for numbers:
        randStr += String.fromCodePoint(randInt(0x30, 0x39))
      }
      else if (rand1in3 < 2) {
        // ASCII codes for uppercase.
        randStr += String.fromCodePoint(randInt(0x41, 0x5A))
      }
      else {
        // ASCII codes for lowercase.        
        randStr += String.fromCodePoint(randInt(0x61, 0x7A))
      }
    }
    else if (useOnlyPrintableASCII && !useOnlyAlphaNum) {
      randStr += String.fromCodePoint(randInt(0x20, 0x7E))
    }
    else {
      randStr += String.fromCodePoint(randInt(maxCodePoint))
    }
  }

  return randStr
}



describe("Fuzz-Testing:", () => {
  
  test.only(`Testing fuzzing probability distribution space:`, async () => {
    const OverlapTestArr: string[] = []
    
    // create a lot of sample data, using Law of Large Numbers:
    for (let i = 0; i < 10_000; i++){
      OverlapTestArr[i] = fuzzGibberish(1, false, true, true)
    }

    const distribMap: Map<string,number> = new Map()

    // count how many times a string appears, to test the randomness of the distribution:
    OverlapTestArr.forEach((randStr)=>{
      // incr an existing str, or init a new str counter:
      distribMap.set(
        randStr, 
        (distribMap.get(randStr) ?? 0) + 1
      )
    })

    expect(distribMap.size).toBeLessThanOrEqual(26)
    expect(distribMap.size).toBeGreaterThan(26*0.95)

    distribMap.forEach((count)=>{
      expect(count).toBeGreaterThanOrEqual((10_000/26)*0.95)
    })
  })

  describe("SemVer pkg", () => {

  })
})


describe("The options use to set program command behavior.", () => {
  test.todo("Use Fuzzing to test command argument parsing.")

  test("args: pkg", async () => {})
  // test("", async () => {})
  // test("", async () => {})
})
