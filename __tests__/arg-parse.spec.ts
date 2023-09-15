/* eslint-disable @typescript-eslint/no-empty-function */
import { describe, test /* expect */ } from "@jest/globals"
// import * as cli from "../src-ts/arg-parse"
// import { OpsPipeline } from "../src-ts/op-queue-pipeline"
/* const cli = {
  verifyOptions: jest.fn(),
  sanitizePkgName: jest.fn(),
  readPkgName: jest.fn(),
  readPkgVersion: jest.fn()
} */
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
 * - Fuzz-testing should be used to find any bugs or vulnerabilities in the CLI.
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
  } else {
    // use the only arg received as the max:
    max = Math.floor(minOrMax)
  }

  return Math.floor(Math.random() * (max - min + 1) + min)
}

/** @summary The input string fuzzing generator. */
const fuzzGibberish = (
  maxStrLen = 1000,
  useAllUnicode = false,
  useOnlyPrintableASCII = false,
  useOnlyAlphaNum = false
): string => {
  // gibberish ASCII or unicode string:
  let randStr = ""

  // max string length:
  const strLen = randInt(maxStrLen < 1 ? 0 : 1, maxStrLen)

  // set max char set value:
  const maxCodePoint = useAllUnicode ? 0x10ffff : 0x7f

  // produce a random ASCII or Unicode character sequence:
  // Unicode: U+0000 through U+10FFFF (base16),
  //   U+D800 through U+DFFF,  are used to encode surrogate pairs in UTF-16.
  // ASCII: 0x00 through 0x7F, codes 0x20 to 0x7E, are known as the printable characters,
  //   ASCII reserves the first 32 codes (0x00 through 0x1F) and 0x7F for control characters.
  if (useOnlyPrintableASCII && useOnlyAlphaNum) {
    for (let i = 0; i < strLen; i++) {
      const rand1in3 = Math.random()

      if (rand1in3 < 26 / 62) {
        // ASCII codes for lowercase.
        randStr += String.fromCodePoint(randInt(0x61, 0x7a))
      } else if (rand1in3 < 52 / 62) {
        // ASCII codes for uppercase.
        randStr += String.fromCodePoint(randInt(0x41, 0x5a))
      } else {
        // ASCII codes for numbers:
        randStr += String.fromCodePoint(randInt(0x30, 0x39))
      }
    }
  } else if (useOnlyPrintableASCII) {
    for (let i = 0; i < strLen; i++) {
      randStr += String.fromCodePoint(randInt(0x20, 0x7e))
    }
  } else {
    for (let i = 0; i < strLen; i++) {
      randStr += String.fromCodePoint(randInt(maxCodePoint))
    }
  }

  return randStr
}

/** @summary Another input string fuzzing generator, that can use a array single character strings for specific ranges. */
const fuzzGibberishRange = ({
  maxStrLen = 1000,
  addChars,
  onlyChars,
  useAllUnicode = false,
  useOnlyPrintableASCII = false,
  useOnlyAlphaNum = false
}: {
  maxStrLen?: number
  useAllUnicode?: boolean
  useOnlyPrintableASCII?: boolean
  useOnlyAlphaNum?: boolean
  addChars?: string[]
  onlyChars?: string[]
}): string => {
  // gibberish ASCII or unicode string:
  let randStr = ""

  // max string length:
  const strLen = randInt(maxStrLen < 1 ? 0 : 1, maxStrLen)

  // set max char set value:
  const maxCodePoint = useAllUnicode ? 0x10ffff : 0x7f

  // produce a random ASCII or Unicode character sequence:
  // Unicode: U+0000 through U+10FFFF (base16),
  //   U+D800 through U+DFFF,  are used to encode surrogate pairs in UTF-16.
  // ASCII: 0x00 through 0x7F, codes 0x20 to 0x7E, are known as the printable characters,
  //   ASCII reserves the first 32 codes (0x00 through 0x1F) and 0x7F for control characters.
  if (onlyChars instanceof Array) {
    for (let i = 0; i < strLen; i++) {
      randStr += onlyChars[Math.floor(Math.random() * onlyChars.length)]
    }
  } else if (useOnlyAlphaNum) {
    // number of possible strings:
    const strOdds: number = (addChars?.length ?? 0) + 62 // number of alphanumeric characters.

    for (let i = 0; i < strLen; i++) {
      const rand = Math.random()

      if (rand < 26 / strOdds) {
        // ASCII codes for lowercase.
        randStr += String.fromCodePoint(randInt(0x61, 0x7a))
      } else if (rand < 52 / strOdds) {
        // ASCII codes for uppercase.
        randStr += String.fromCodePoint(randInt(0x41, 0x5a))
      } else if (rand < 62 / strOdds) {
        // ASCII codes for numbers:
        randStr += String.fromCodePoint(randInt(0x30, 0x39))
      } else if (addChars instanceof Array) {
        // uses one of the added characters:
        randStr += addChars[Math.floor(Math.random() * addChars.length)]
      }
    }
  } else if (useOnlyPrintableASCII) {
    // number of possible strings:
    const strOdds: number = (addChars?.length ?? 0) + 95 // number of ASCII printable characters.

    for (let i = 0; i < strLen; i++) {
      if (Math.random() < 95 / strOdds) {
        // ASCII printable characters:
        randStr += String.fromCodePoint(randInt(0x20, 0x7e))
      } else if (addChars instanceof Array) {
        // uses one of the added characters:
        randStr += addChars[Math.floor(Math.random() * addChars.length)]
      }
    }
  } else {
    for (let i = 0; i < strLen; i++) {
      randStr += String.fromCodePoint(randInt(maxCodePoint))
    }
  }

  return randStr
}

describe("Fuzz-Testing:", () => {
  describe("Testing Fuzz testers:", () => {
    describe("Gibberish string Fuzzer:", () => {
      test("Testing fuzzing probability distribution space, may randomly fail (on occasion):", async () => {
        const posSpace = 26 + 26 + 10 // alpha-numeric possibility space.
        const OverlapTestArr: string[] = []

        // create a lot of sample data, using Law of Large Numbers:
        for (let i = 0; i < 10000; i++) {
          OverlapTestArr[i] = fuzzGibberish(1, false, true, true)
        }

        const distribMap: Map<string, number> = new Map()

        // count how many times a string appears, to test the randomness of the distribution:
        OverlapTestArr.forEach(randStr => {
          // incr an existing str, or init a new str counter:
          distribMap.set(randStr, (distribMap.get(randStr) ?? 0) + 1)
        })

        expect(distribMap.size).toBeLessThanOrEqual(posSpace)
        expect(distribMap.size).toBeGreaterThan(Math.floor(posSpace * 0.95))

        // check the distribution:
        const modes = Array.from(distribMap.values()).sort()
        const min = Math.min(...modes)
        const max = Math.max(...modes)

        expect(max).toBeLessThanOrEqual(Math.ceil((10000 / posSpace) * 1.25)) // max occurrences of a specific str:

        expect(min).toBeGreaterThanOrEqual(Math.floor((10000 / posSpace) * 0.68)) // min occurrences of a specific str:

        expect(max - min).toBeLessThanOrEqual(Math.floor(10000 / posSpace / 2)) // range of occurrences of a all str:
      })
    })

    describe("Range string Fuzzer:", () => {
      test("Testing fuzzing probability distribution, may randomly fail (on occasion):", async () => {
        const posSpace = 26 + 26 + 10 // alpha-numeric possibility space.
        const OverlapTestArr: string[] = []

        // create a lot of sample data, using Law of Large Numbers:
        for (let i = 0; i < 10000; i++) {
          OverlapTestArr[i] = fuzzGibberishRange({ maxStrLen: 1, useOnlyAlphaNum: true, useOnlyPrintableASCII: true })
        }

        const distribMap: Map<string, number> = new Map()

        // count how many times a string appears, to test the randomness of the distribution:
        OverlapTestArr.forEach(randStr => {
          // incr an existing str, or init a new str counter:
          distribMap.set(randStr, (distribMap.get(randStr) ?? 0) + 1)
        })

        expect(distribMap.size).toBeLessThanOrEqual(posSpace)
        expect(distribMap.size).toBeGreaterThan(Math.floor(posSpace * 0.95))

        // check the distribution:
        const modes = Array.from(distribMap.values()).sort()
        const min = Math.min(...modes)
        const max = Math.max(...modes)

        expect(max).toBeLessThanOrEqual(Math.ceil((10000 / posSpace) * 1.25)) // max occurrences of a specific str:

        expect(min).toBeGreaterThanOrEqual(Math.floor((10000 / posSpace) * 0.68)) // min occurrences of a specific str:

        expect(max - min).toBeLessThanOrEqual(Math.floor(10000 / posSpace / 2)) // range of occurrences of a all str:
      })

      test("Testing adding characters to distribution, may randomly fail (on occasion):", async () => {
        const addChars = ["@", "/", "-", "_"]
        const posSpace = 26 + 26 + 10 + addChars.length // alpha-numeric possibility space.
        const OverlapTestArr: string[] = []

        // create a lot of sample data, using Law of Large Numbers:
        for (let i = 0; i < 10000; i++) {
          OverlapTestArr[i] = fuzzGibberishRange({
            maxStrLen: 1,
            addChars,
            useOnlyAlphaNum: true,
            useOnlyPrintableASCII: true
          })
        }

        const distribMap: Map<string, number> = new Map()

        // count how many times a string appears, to test the randomness of the distribution:
        OverlapTestArr.forEach(randStr => {
          // incr an existing str, or init a new str counter:
          distribMap.set(randStr, (distribMap.get(randStr) ?? 0) + 1)
        })

        expect(distribMap.size).toBeLessThanOrEqual(posSpace)
        expect(distribMap.size).toBeGreaterThan(Math.floor(posSpace * 0.95))

        // check the distribution:
        const modes = Array.from(distribMap.values()).sort()
        const min = Math.min(...modes)
        const max = Math.max(...modes)

        expect(max).toBeLessThanOrEqual(Math.ceil((10000 / posSpace) * 1.25)) // max occurrences of a specific str:

        expect(min).toBeGreaterThanOrEqual(Math.floor((10000 / posSpace) * 0.68)) // min occurrences of a specific str:

        expect(max - min).toBeLessThanOrEqual(Math.floor(10000 / posSpace / 2)) // range of occurrences of a all str:
      })

      test('Testing using "onlyChars" in distribution, may randomly fail (on occasion):', async () => {
        const onlyChars = ["a", "m", "z"]
        const posSpace = onlyChars.length // alpha-numeric possibility space.
        const OverlapTestArr: string[] = []

        // create a lot of sample data, using Law of Large Numbers:
        for (let i = 0; i < 10000; i++) {
          OverlapTestArr[i] = fuzzGibberishRange({ maxStrLen: 1, onlyChars })
        }

        const distribMap: Map<string, number> = new Map()

        // count how many times a string appears, to test the randomness of the distribution:
        OverlapTestArr.forEach(randStr => {
          // incr an existing str, or init a new str counter:
          distribMap.set(randStr, (distribMap.get(randStr) ?? 0) + 1)
        })

        expect(distribMap.size).toBeLessThanOrEqual(posSpace)
        expect(distribMap.size).toBeGreaterThan(Math.floor(posSpace * 0.95))

        // check the distribution:
        const modes = Array.from(distribMap.values()).sort()
        const min = Math.min(...modes)
        const max = Math.max(...modes)

        expect(max).toBeLessThanOrEqual(Math.ceil((10000 / posSpace) * 1.25)) // max occurrences of a specific str:

        expect(min).toBeGreaterThanOrEqual(Math.floor((10000 / posSpace) * 0.68)) // min occurrences of a specific str:

        expect(max - min).toBeLessThanOrEqual(Math.floor(10000 / posSpace / 2)) // range of occurrences of a all str:
      })
    })
  })

  describe("SemVer Version parsing:", () => {})
  /* 
  describe("CLI arguments using user-defined input strings:", () => {
    test("Package name arg:", async () => {
      const addChars = ["@","/","-","_"]
      const testPkgStr = fuzzGibberishRange({maxStrLen: 10000, addChars, useOnlyAlphaNum: true})

      for (let i = 0; i < 100; i++) {
        expect(cli.argParser(['--', testPkgStr], cli.commander)).resolves.toHaveProperty("pkgs")
      }
    })
    
    test("Package version arg:", async () => {
      const addChars = ["@","/","-","_"]
      const testPkgStr = fuzzGibberishRange({maxStrLen: 10000, addChars, useOnlyAlphaNum: true})
      const testPkgVer = fuzzGibberishRange({maxStrLen: 10000, onlyChars: [".", ..."0123456789".split("")]})
      // const testPkgStrWithVer = `${testPkgStr}@${testPkgVer}`

      for (let i = 0; i < 100; i++) {
        expect(cli.argParser(['--', testPkgStr], cli.commander)).resolves.toHaveProperty("pkgs", expect.objectContaining({
          [testPkgStr]: testPkgVer
        }))
      }
    })

  })
   */
  describe("The options use to set program command behavior.", () => {
    test.todo("Use Fuzzing to test command argument parsing.")

    test("args: pkg", async () => {})
    // test("", async () => {})

    describe("CLI options:", () => {
      // test("", async () => {})

      describe("Basic CLI options:", () => {
        // test("", async () => {})

        describe("Common opts:", () => {
          test.todo("Opt: -- (flag to read following arguments as pkgs.) :")
          test.todo("Opt: --dry-run :")
          test.todo("Opt: --force | -f :")
          test.todo("Opt: --no | --no-yes | -n :")
          test.todo("Opt: --no-save :")
          test.todo("Opt: --save | -S :")
          test.todo("Opt: --save-prod | -P :")
          test.todo("Opt: --save-dev | -O:")
          test.todo("Opt: --save-optional | -O :")
          test.todo("Opt: --save-exact | -E :")
          test.todo("Opt: --save-bundle | -B :")
          test.todo("Opt: --usage | --help | -? | -h | -H :")
          test.todo("Opt: --version | -v :")
          test.todo("Opt: --yes | -y :")
        })

        describe("Useful opts:", () => {
          test.todo("Opt: --audit :")
          test.todo("Opt: --audit-level :")
          test.todo("Opt: --before | --enjoy-by :")
          test.todo("Opt: --color :")
          test.todo("Opt: --description | --desc :")
          test.todo("Opt: --include :")
          test.todo("Opt: --json :")
          test.todo("Opt: --legacy-bundling :")
          test.todo("Opt: --legacy-peer-deps :")
          test.todo(
            'Opt: --loglevel ("silent", "error", "warn", "notice", "http", "timing", "info", "verbose", or "silly") :'
          )
          test.todo("Opt: --loglevel silent | --silent | -s :")
          test.todo("Opt: --loglevel warn | --quiet | -q :")
          test.todo("Opt: --loglevel info | -d :")
          test.todo("Opt: --loglevel verbose | --verbose | --dd :")
          test.todo("Opt: --loglevel silly | --ddd :")
          test.todo("Opt: --long | -l :")
          test.todo("Opt: --maxsockets:")
          test.todo("Opt: --node-version:")
          test.todo("Opt: --omit :")
          test.todo("Opt: --parseable | --porcelain | -p :")
          test.todo("Opt: --searchexclude :")
          test.todo("Opt: --searchlimit :")
          test.todo("Opt: --searchopts :")
          test.todo("Opt: --searchstaleness :")
          test.todo("Opt: --strict-peer-deps :")
          test.todo("Opt: --tag :")
        })

        describe("Extraneous opts:", () => {
          test.todo("Opt: - (flag to read arguments from stdin.) :")
          test.todo("Opt: --bin-links :")
          test.todo("Opt: --browser :")
          test.todo("Opt: --ca :")
          test.todo("Opt: --cache :")
          test.todo("Opt: --cafile :")
          test.todo("Opt: --cert :")
          test.todo("Opt: --ci-name :")
          test.todo("Opt: --engine-strict :")
          test.todo("Opt: --fetch-retries :")
          test.todo("Opt: --fetch-retry-factor :")
          test.todo("Opt: --fetch-retry-maxtimeout :")
          test.todo("Opt: --fetch-retry-mintimeout :")
          test.todo("Opt: --fetch-timeout :")
          test.todo("Opt: --foreground-scripts :")
          test.todo("Opt: --fund :")
          test.todo("Opt: --global | -g :")
          test.todo("Opt: --global-style :")
          test.todo("Opt: --globalconfig :")
          test.todo("Opt: --heading :")
          test.todo("Opt: --https-proxy :")
          test.todo("Opt: --if-present :")
          test.todo("Opt: --ignore-scripts :")
          test.todo("Opt: --include-staged :")
          test.todo("Opt: --key :")
          test.todo("Opt: --local | --no-global :")
          test.todo("Opt: --local-address:")
          test.todo("Opt: --noproxy:")
          test.todo("Opt: --npm-version:")
          test.todo("Opt: --offline:")
          test.todo("Opt: --online:")
          test.todo("Opt: --pack-destination :")
          test.todo("Opt: --package:")
          test.todo("Opt: --package-lock :")
          test.todo("Opt: --package-lock-only :")
          test.todo("Opt: --prefer-offline:")
          test.todo("Opt: --prefer-online:")
          test.todo("Opt: --prefix | -C :")
          test.todo("Opt: --preid :")
          test.todo("Opt: --progress :")
          test.todo("Opt: --proxy:")
          test.todo("Opt: --readonly | --read-only :")
          test.todo("Opt: --rebuild-bundle:")
          test.todo("Opt: --registry | --reg :")
          test.todo("Opt: --save-prefix :")
          test.todo("Opt: --scope :")
          test.todo("Opt: --script-shell :")
          test.todo("Opt: --shell :")
          test.todo("Opt: --strict-ssl :")
          test.todo("Opt: --timing :")
          test.todo("Opt: --umask :")
          test.todo("Opt: --unicode :")
          test.todo("Opt: --update-notifier :")
          test.todo("Opt: --user-agent :")
          test.todo("Opt: --userconfig :")
          test.todo("Opt: --versions :")
          test.todo("Opt: --viewer :")
          test.todo("Opt: --which :")
          test.todo("Opt: --workspace | -w :")
          test.todo("Opt: --workspaces | --ws :")
        })

        describe("NPM Deprecated opts:", () => {
          test.todo("Opt: --also :")
          test.todo("Opt: --auth-type :")
          test.todo("Opt: --cache-max :")
          test.todo("Opt: --cache-min :")
          test.todo("Opt: --dev :")
          test.todo("Opt: --only :")
          test.todo("Opt: --optional :")
          test.todo("Opt: --production :")
          test.todo("Opt: --shrinkwrap :")
          test.todo("Opt: --sso-poll-frequency :")
          test.todo("Opt: --sso-type :")
          test.todo("Opt: --tmp :")
        })
      })
    })
  })
})

/* describe("SemVer Version parsing:", () => {

})

describe("CLI arguments using user-defined input strings:", () => {
  test("Package name arg:", async () => {
    const res = await cli.command(["-vv", "npm"])
    console.log(res.opts?.())
    console.log(res.args)
  })
  
  test("Package version arg:", async () => {
    expect(await cli.command(["--", "packageName"])).toHaveProperty("args", ["packageName"])
  })

}) */

describe("The options use to set program command behavior.", () => {
  test.todo("Use Fuzzing to test command argument parsing.")

  test("args: pkg", async () => {})
  // test("", async () => {})

  describe("CLI options:", () => {
    // test("", async () => {})

    describe("Basic CLI options:", () => {
      // test("", async () => {})

      describe("Common opts:", () => {
        test.todo("Opt: -- (flag to read following arguments as pkgs.) :")
        test.todo("Opt: --dry-run :")
        test.todo("Opt: --force | -f :")
        test.todo("Opt: --no | --no-yes | -n :")
        test.todo("Opt: --no-save :")
        test.todo("Opt: --save | -S :")
        test.todo("Opt: --save-prod | -P :")
        test.todo("Opt: --save-dev | -O:")
        test.todo("Opt: --save-optional | -O :")
        test.todo("Opt: --save-exact | -E :")
        test.todo("Opt: --save-bundle | -B :")
        test.todo("Opt: --usage | --help | -? | -h | -H :")
        test.todo("Opt: --version | -v :")
        test.todo("Opt: --yes | -y :")
      })

      describe("Useful opts:", () => {
        test.todo("Opt: --audit :")
        test.todo("Opt: --audit-level :")
        test.todo("Opt: --before | --enjoy-by :")
        test.todo("Opt: --color :")
        test.todo("Opt: --description | --desc :")
        test.todo("Opt: --include :")
        test.todo("Opt: --json :")
        test.todo("Opt: --legacy-bundling :")
        test.todo("Opt: --legacy-peer-deps :")
        test.todo(
          'Opt: --loglevel ("silent", "error", "warn", "notice", "http", "timing", "info", "verbose", or "silly") :'
        )
        test.todo("Opt: --loglevel silent | --silent | -s :")
        test.todo("Opt: --loglevel warn | --quiet | -q :")
        test.todo("Opt: --loglevel info | -d :")
        test.todo("Opt: --loglevel verbose | --verbose | --dd :")
        test.todo("Opt: --loglevel silly | --ddd :")
        test.todo("Opt: --long | -l :")
        test.todo("Opt: --maxsockets:")
        test.todo("Opt: --node-version:")
        test.todo("Opt: --omit :")
        test.todo("Opt: --parseable | --porcelain | -p :")
        test.todo("Opt: --searchexclude :")
        test.todo("Opt: --searchlimit :")
        test.todo("Opt: --searchopts :")
        test.todo("Opt: --searchstaleness :")
        test.todo("Opt: --strict-peer-deps :")
        test.todo("Opt: --tag :")
      })

      describe("Extraneous opts:", () => {
        test.todo("Opt: - (flag to read arguments from stdin.) :")
        test.todo("Opt: --bin-links :")
        test.todo("Opt: --browser :")
        test.todo("Opt: --ca :")
        test.todo("Opt: --cache :")
        test.todo("Opt: --cafile :")
        test.todo("Opt: --cert :")
        test.todo("Opt: --ci-name :")
        test.todo("Opt: --engine-strict :")
        test.todo("Opt: --fetch-retries :")
        test.todo("Opt: --fetch-retry-factor :")
        test.todo("Opt: --fetch-retry-maxtimeout :")
        test.todo("Opt: --fetch-retry-mintimeout :")
        test.todo("Opt: --fetch-timeout :")
        test.todo("Opt: --foreground-scripts :")
        test.todo("Opt: --fund :")
        test.todo("Opt: --global | -g :")
        test.todo("Opt: --global-style :")
        test.todo("Opt: --globalconfig :")
        test.todo("Opt: --heading :")
        test.todo("Opt: --https-proxy :")
        test.todo("Opt: --if-present :")
        test.todo("Opt: --ignore-scripts :")
        test.todo("Opt: --include-staged :")
        test.todo("Opt: --key :")
        test.todo("Opt: --local | --no-global :")
        test.todo("Opt: --local-address:")
        test.todo("Opt: --noproxy:")
        test.todo("Opt: --npm-version:")
        test.todo("Opt: --offline:")
        test.todo("Opt: --online:")
        test.todo("Opt: --pack-destination :")
        test.todo("Opt: --package:")
        test.todo("Opt: --package-lock :")
        test.todo("Opt: --package-lock-only :")
        test.todo("Opt: --prefer-offline:")
        test.todo("Opt: --prefer-online:")
        test.todo("Opt: --prefix | -C :")
        test.todo("Opt: --preid :")
        test.todo("Opt: --progress :")
        test.todo("Opt: --proxy:")
        test.todo("Opt: --readonly | --read-only :")
        test.todo("Opt: --rebuild-bundle:")
        test.todo("Opt: --registry | --reg :")
        test.todo("Opt: --save-prefix :")
        test.todo("Opt: --scope :")
        test.todo("Opt: --script-shell :")
        test.todo("Opt: --shell :")
        test.todo("Opt: --strict-ssl :")
        test.todo("Opt: --timing :")
        test.todo("Opt: --umask :")
        test.todo("Opt: --unicode :")
        test.todo("Opt: --update-notifier :")
        test.todo("Opt: --user-agent :")
        test.todo("Opt: --userconfig :")
        test.todo("Opt: --versions :")
        test.todo("Opt: --viewer :")
        test.todo("Opt: --which :")
        test.todo("Opt: --workspace | -w :")
        test.todo("Opt: --workspaces | --ws :")
      })

      describe("NPM Deprecated opts:", () => {
        test.todo("Opt: --also :")
        test.todo("Opt: --auth-type :")
        test.todo("Opt: --cache-max :")
        test.todo("Opt: --cache-min :")
        test.todo("Opt: --dev :")
        test.todo("Opt: --only :")
        test.todo("Opt: --optional :")
        test.todo("Opt: --production :")
        test.todo("Opt: --shrinkwrap :")
        test.todo("Opt: --sso-poll-frequency :")
        test.todo("Opt: --sso-type :")
        test.todo("Opt: --tmp :")
      })
    })
  })
})
