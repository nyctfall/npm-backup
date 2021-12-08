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


/** @summary The input string fuzzing generator. */
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
  if (useOnlyPrintableASCII && useOnlyAlphaNum){
    for (let i = 0; i < strLen; i++){
      const rand1in3 = Math.random()
      
      if (rand1in3 < 26/62){
        // ASCII codes for lowercase.        
        randStr += String.fromCodePoint(randInt(0x61, 0x7A))
      }
      else if (rand1in3 < 52/62) {
        // ASCII codes for uppercase.
        randStr += String.fromCodePoint(randInt(0x41, 0x5A))
      }
      else {
        // ASCII codes for numbers:
        randStr += String.fromCodePoint(randInt(0x30, 0x39))
      }
    }
  }
  else if (useOnlyPrintableASCII) {
    for (let i = 0; i < strLen; i++){
      randStr += String.fromCodePoint(randInt(0x20, 0x7E))
    }
  }
  else {
    for (let i = 0; i < strLen; i++){
      randStr += String.fromCodePoint(randInt(maxCodePoint))
    }
  }

  return randStr
}

/** @summary Another input string fuzzing generator, that can use a array single character strings for specific ranges. */
const fuzzGibberishRange = ({ maxStrLen = 1000, addChars, onlyChars, useAllUnicode = false, useOnlyPrintableASCII = false, useOnlyAlphaNum = false }: { maxStrLen?: number, useAllUnicode?: boolean, useOnlyPrintableASCII?: boolean, useOnlyAlphaNum?: boolean, addChars?: string[], onlyChars?: string[] }): string => {
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
  if (onlyChars instanceof Array){
    for (let i = 0; i < strLen; i++){
      randStr += onlyChars[Math.floor(Math.random()*onlyChars.length)]
    }
  }
  else if (useOnlyPrintableASCII){
    // number of possible strings:
    const strOdds: number = (addChars?.length ?? 0) + ((useOnlyAlphaNum) 
      ? 62 // number of alphanumeric characters.
      : 95) // number of ASCII printable characters.
    
    if (useOnlyAlphaNum){
      for (let i = 0; i < strLen; i++){
        const rand = Math.random()
        
        if (rand < 26/strOdds){
          // ASCII codes for lowercase.        
          randStr += String.fromCodePoint(randInt(0x61, 0x7A))
        }
        else if (rand < 52/strOdds) {
          // ASCII codes for uppercase.
          randStr += String.fromCodePoint(randInt(0x41, 0x5A))
        }
        else if (rand < 62/strOdds){
          // ASCII codes for numbers:
          randStr += String.fromCodePoint(randInt(0x30, 0x39))
        }
        else if (addChars instanceof Array){
          // uses one of the added characters:
          randStr += addChars[Math.floor(Math.random()*addChars.length)]
        }
      }
    }
    else {
      for (let i = 0; i < strLen; i++){
        if (Math.random() < 95/strOdds) {
          // ASCII printable characters:
          randStr += String.fromCodePoint(randInt(0x20, 0x7E))
        }
        else if (addChars instanceof Array) {
          // uses one of the added characters:
          randStr += addChars[Math.floor(Math.random()*addChars.length)]
        }
      }
    }
  }
  else {
    for (let i = 0; i < strLen; i++){
      randStr += String.fromCodePoint(randInt(maxCodePoint))
    }
  }

  return randStr
}



describe("Fuzz-Testing:", () => {
  describe("Testing Fuzz testers:", () => {
    describe("Gibberish string Fuzzer:", () => {
      test(`Testing fuzzing probability distribution space, may randomly fail (on occation):`, async () => {
        const posSpace = 26+26+10 // alpha-numeric possibility space.
        const OverlapTestArr: string[] = []
        
        // create a lot of sample data, using Law of Large Numbers:
        for (let i = 0; i < 10000; i++){
          OverlapTestArr[i] = fuzzGibberish(1, false, true, true)
        }
    
        const distribMap: Map<string,number> = new Map()
    
        // count how many times a string appears, to test the randomness of the distribution:
        OverlapTestArr.forEach((randStr) => {
          // incr an existing str, or init a new str counter:
          distribMap.set(
            randStr, 
            (distribMap.get(randStr) ?? 0) + 1
          )
        })
    
        expect(distribMap.size).toBeLessThanOrEqual(posSpace)
        expect(distribMap.size).toBeGreaterThan(Math.floor(posSpace*0.95))
        
        // check the distribution:
        const modes = Array.from(distribMap.values()).sort()
        const min = Math.min(...modes)
        const max = Math.max(...modes)
    
        expect(max).toBeLessThanOrEqual(Math.ceil((10000/posSpace) * 1.25)) // max occurences of a specific str:
        
        expect(min).toBeGreaterThanOrEqual(Math.floor((10000/posSpace) * 0.68)) // min occurences of a specific str:
        
        expect(max-min).toBeLessThanOrEqual(Math.floor((10000/posSpace)/2)) // range of occurences of a all str:
      })
    })
    
    describe("Range string Fuzzer:", () => {
      test(`Testing fuzzing probability distribution, may randomly fail (on occation):`, async () => {
        const posSpace = 26+26+10 // alpha-numeric possibility space.
        const OverlapTestArr: string[] = []
        
        // create a lot of sample data, using Law of Large Numbers:
        for (let i = 0; i < 10000; i++){
          OverlapTestArr[i] = fuzzGibberishRange({maxStrLen: 1, useOnlyAlphaNum: true, useOnlyPrintableASCII: true})
        }
    
        const distribMap: Map<string,number> = new Map()
    
        // count how many times a string appears, to test the randomness of the distribution:
        OverlapTestArr.forEach((randStr) => {
          // incr an existing str, or init a new str counter:
          distribMap.set(
            randStr, 
            (distribMap.get(randStr) ?? 0) + 1
          )
        })
    
        expect(distribMap.size).toBeLessThanOrEqual(posSpace)
        expect(distribMap.size).toBeGreaterThan(Math.floor(posSpace*0.95))
        
        // check the distribution:
        const modes = Array.from(distribMap.values()).sort()
        const min = Math.min(...modes)
        const max = Math.max(...modes)
        console.log(modes,min,max,max-min,distribMap)
    
        expect(max).toBeLessThanOrEqual(Math.ceil((10000/posSpace) * 1.25)) // max occurences of a specific str:
        
        expect(min).toBeGreaterThanOrEqual(Math.floor((10000/posSpace) * 0.68)) // min occurences of a specific str:
        
        expect(max-min).toBeLessThanOrEqual(Math.floor((10000/posSpace)/2)) // range of occurences of a all str:
      })

      test(`Testing adding characters to distribution, may randomly fail (on occation):`, async () => {
        const addChars = ["@","/","-","_"]
        const posSpace = 26+26+10 + addChars.length // alpha-numeric possibility space.
        const OverlapTestArr: string[] = []
        
        // create a lot of sample data, using Law of Large Numbers:
        for (let i = 0; i < 10000; i++){
          OverlapTestArr[i] = fuzzGibberishRange({maxStrLen: 1, addChars, useOnlyAlphaNum: true, useOnlyPrintableASCII: true})
        }
    
        const distribMap: Map<string,number> = new Map()
    
        // count how many times a string appears, to test the randomness of the distribution:
        OverlapTestArr.forEach((randStr) => {
          // incr an existing str, or init a new str counter:
          distribMap.set(
            randStr, 
            (distribMap.get(randStr) ?? 0) + 1
          )
        })
    
        expect(distribMap.size).toBeLessThanOrEqual(posSpace)
        expect(distribMap.size).toBeGreaterThan(Math.floor(posSpace*0.95))
        
        // check the distribution:
        const modes = Array.from(distribMap.values()).sort()
        const min = Math.min(...modes)
        const max = Math.max(...modes)
        console.log(modes,min,max,max-min,distribMap)
    
        expect(max).toBeLessThanOrEqual(Math.ceil((10000/posSpace) * 1.25)) // max occurences of a specific str:
        
        expect(min).toBeGreaterThanOrEqual(Math.floor((10000/posSpace) * 0.68)) // min occurences of a specific str:
        
        expect(max-min).toBeLessThanOrEqual(Math.floor((10000/posSpace)/2)) // range of occurences of a all str:
      })

      test(`Testing using "onlyChars" in distribution, may randomly fail (on occation):`, async () => {
        const onlyChars = ["a","m","z"]
        const posSpace = onlyChars.length // alpha-numeric possibility space.
        const OverlapTestArr: string[] = []
        
        // create a lot of sample data, using Law of Large Numbers:
        for (let i = 0; i < 10000; i++){
          OverlapTestArr[i] = fuzzGibberishRange({maxStrLen: 1, onlyChars})
        }
    
        const distribMap: Map<string,number> = new Map()
    
        // count how many times a string appears, to test the randomness of the distribution:
        OverlapTestArr.forEach((randStr) => {
          // incr an existing str, or init a new str counter:
          distribMap.set(
            randStr, 
            (distribMap.get(randStr) ?? 0) + 1
          )
        })
    
        expect(distribMap.size).toBeLessThanOrEqual(posSpace)
        expect(distribMap.size).toBeGreaterThan(Math.floor(posSpace*0.95))
        
        // check the distribution:
        const modes = Array.from(distribMap.values()).sort()
        const min = Math.min(...modes)
        const max = Math.max(...modes)
        console.log(modes,max-min,distribMap)
    
        expect(max).toBeLessThanOrEqual(Math.ceil((10000/posSpace) * 1.25)) // max occurences of a specific str:
        
        expect(min).toBeGreaterThanOrEqual(Math.floor((10000/posSpace) * 0.68)) // min occurences of a specific str:
        
        expect(max-min).toBeLessThanOrEqual(Math.floor((10000/posSpace)/2)) // range of occurences of a all str:
      })
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
